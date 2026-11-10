from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import warnings
from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.stattools import adfuller, kpss

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "It's Working!"

@app.route('/processarSS', methods=['POST'])
def processar_dados_ss():
    try:
        dados = request.get_json()
        df = pd.DataFrame(dados)

        # Calcula a média móvel e mantém os dados originais
        df['ws100_suavizado'] = df['ws100'].rolling(window=6).mean().fillna(0)

        # Formata os dados como uma lista de arrays: [timestamp, valor_suavizado]
        dados_formatados = [
            [row['id'], row['ws100_suavizado']]
            for _, row in df.iterrows()
        ]

        # print("Dados formatados:", dados_formatados)
        return jsonify(dados_formatados), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# Versão 1
# @app.route('/processarDFA', methods=['POST'])
# def processar_dados_dfa():
#     # Baseado no repositório fathon (https://github.com/stfbnc/fathon)
#     try:
#         dados = request.get_json()
#         df = pd.DataFrame(dados)

#         # Pega só a velocidade e remove NaNs
#         serie = df['ws100'].dropna().astype(float).values

#         # 1. toAggregated: subtrai média e soma cumulativa
#         serie_agg = np.nancumsum(serie - np.nanmean(serie))

#         # 2. Tamanhos de janela (winSizes)
#         n_min = 10
#         n_max = len(serie_agg) // 4  # regra geral para DFA
#         winSizes = np.unique(np.logspace(
#             np.log10(n_min), np.log10(n_max), num=40
#         ).astype(int))

#         # 3. computeFlucVec: calcula F(n) para cada janela
#         F = []
#         n_vals = []
#         pol_ord = 1  # DFA-1

#         for n in winSizes:
#             num_seg = len(serie_agg) // n
#             if num_seg < 2:
#                 continue

#             residuos = []
#             for s in range(num_seg):
#                 seg = serie_agg[s*n:(s+1)*n]
#                 x = np.arange(n)
#                 # Ajusta polinômio (detrending)
#                 coef = np.polyfit(x, seg, pol_ord)
#                 tendencia = np.polyval(coef, x)
#                 residuos.append(np.mean((seg - tendencia) ** 2))

#             F_n = np.sqrt(np.mean(residuos))
#             F.append(F_n)
#             n_vals.append(n)

#         n_vals = np.array(n_vals)
#         F = np.array(F)

#         # 4. fitFlucVec: regressão linear em log-log → expoente H
#         ln_n = np.log(n_vals)
#         ln_F = np.log(F)
#         coef = np.polyfit(ln_n, ln_F, 1)
#         H = coef[0]
#         H_intercept = coef[1]

#         # Linha de ajuste
#         ln_F_fit = H_intercept + H * ln_n

#         return jsonify({
#             "scales": n_vals.tolist(),       # valores brutos de n
#             "fluct": F.tolist(),             # valores brutos de F(n)
#             "ln_n": ln_n.tolist(),
#             "ln_F": ln_F.tolist(),
#             "ln_F_fit": ln_F_fit.tolist(),
#             "H": round(float(H), 4),
#             "r2": float(np.corrcoef(ln_n, ln_F)[0, 1] ** 2)  # R² do ajuste
#         }), 200

#     except Exception as e:
#         return jsonify({"erro": str(e)}), 500

@app.route('/processarDFA', methods=['POST'])
def processar_dados_dfa():

    """
    DFA-1 otimizado e alinhado conceitualmente ao fathon.

    Características:
    - toAggregated equivalente ao fathon
    - revSeg=True
    - DFA-1 (detrending linear)
    - escalas exponenciais otimizadas
    - regressão em região estável
    - R² estatisticamente correto
    - robustez numérica para séries reais
    """

    try:

        dados = request.get_json()

        df = pd.DataFrame(dados)

        serie = df['ws100'].dropna().astype(float).values

        if len(serie) < 20:

            return jsonify({
                "erro": "Série muito curta para DFA."
            }), 400

        serie_agg = np.nancumsum(
            serie - np.nanmean(serie)
        )

        N = len(serie_agg)

        pol_ord = 1

        n_min = 10
        n_max = N // 2

        if n_max <= n_min:

            return jsonify({
                "erro": "Quantidade insuficiente de dados."
            }), 400

        growth_factor = 1.15

        winSizes = []

        n = n_min

        while n <= n_max:

            winSizes.append(int(n))
            n *= growth_factor

        winSizes = np.unique(
            np.array(winSizes, dtype=int)
        )

        winSizes = winSizes[
            winSizes > (pol_ord + 2)
        ]

        F = []
        n_vals = []

        for n in winSizes:

            num_seg = N // n

            if num_seg < 4:
                continue

            residuos = []

            x = np.arange(n)

            for s in range(num_seg):

                start = s * n
                end = (s + 1) * n

                seg = serie_agg[start:end]

                coef = np.polyfit(
                    x,
                    seg,
                    pol_ord
                )

                tendencia = np.polyval(
                    coef,
                    x
                )

                var_seg = np.mean(
                    (seg - tendencia) ** 2
                )

                residuos.append(var_seg)

            for s in range(num_seg):

                start = N - (s + 1) * n
                end = N - s * n

                seg = serie_agg[start:end]

                coef = np.polyfit(
                    x,
                    seg,
                    pol_ord
                )

                tendencia = np.polyval(
                    coef,
                    x
                )

                var_seg = np.mean(
                    (seg - tendencia) ** 2
                )

                residuos.append(var_seg)

            F_n = np.sqrt(
                np.mean(residuos)
            )

            if np.isfinite(F_n) and F_n > 0:

                F.append(F_n)
                n_vals.append(n)

        n_vals = np.array(n_vals)
        F = np.array(F)

        if len(F) < 6:

            return jsonify({
                "erro": "Pontos insuficientes para regressão DFA."
            }), 400

        ln_n = np.log(n_vals)
        ln_F = np.log(F)

        fit_start = max(
            2,
            int(len(ln_n) * 0.15)
        )

        fit_end = int(
            len(ln_n) * 0.85
        )

        if fit_end <= fit_start:

            return jsonify({
                "erro": "Poucos pontos para regressão DFA."
            }), 400

        ln_n_fit = ln_n[
            fit_start:fit_end
        ]

        ln_F_fit_region = ln_F[
            fit_start:fit_end
        ]

        coef = np.polyfit(
            ln_n_fit,
            ln_F_fit_region,
            1
        )

        H = coef[0]
        intercept = coef[1]

        ln_F_fit = (
            intercept + H * ln_n
        )

        pred = (
            intercept + H * ln_n_fit
        )

        ss_res = np.sum(
            (ln_F_fit_region - pred) ** 2
        )

        ss_tot = np.sum(
            (
                ln_F_fit_region
                - np.mean(ln_F_fit_region)
            ) ** 2
        )

        r2 = 1 - (ss_res / ss_tot)

        return jsonify({

            "scales": n_vals.tolist(),
            "fluct": F.tolist(),
            "ln_n": ln_n.tolist(),
            "ln_F": ln_F.tolist(),
            "ln_F_fit": ln_F_fit.tolist(),
            "H": round(float(H), 6),
            "r2": round(float(r2), 6),

            "dfa_order": pol_ord,
            "revSeg": True,
            "n_scales": len(n_vals),
            "growth_factor": growth_factor,

            "fit_region": {
                "start_index": int(fit_start),
                "end_index": int(fit_end)
            }

        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500

# ───────── Parâmetros da análise ARIMA (decomposição + estacionariedade) ─────────
PERIODO_DIURNO = 24        # sazonalidade diurna, em horas (série agregada por hora)
JANELA_TENDENCIA = 169     # janela do suavizador da tendência (ímpar): ~7 dias
MAX_PONTOS_EXIBICAO = 5000 # limite de pontos enviados ao gráfico (os cálculos usam todos)
MIN_HORAS = 24 * 14        # mínimo de 14 dias de dados


def _num(valor, casas=4):
    """Converte para float do Python. NaN/inf viram None (senão o JSON fica inválido)."""
    try:
        valor = float(valor)
    except (TypeError, ValueError):
        return None
    return round(valor, casas) if np.isfinite(valor) else None


def _testar_estacionariedade(valores):
    """
    ADF: H0 = raiz unitária (série NÃO estacionária).
    KPSS: H0 = série estacionária.
    Estacionária  -> ADF rejeita H0 (p < 0,05) E KPSS não rejeita (p >= 0,05).
    Não estac.    -> ADF não rejeita E KPSS rejeita.
    Inconclusiva  -> os dois testes discordam.
    """
    x = np.asarray(valores, dtype=float)
    x = x[np.isfinite(x)]

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")  # KPSS avisa quando o p-valor sai da tabela (0,01 a 0,10)
        # Defasagem fixa (24 h) em vez de autolag: com dezenas de milhares de pontos,
        # o autolag ajustaria dezenas de regressões e estouraria o tempo do servidor.
        adf_estat, adf_p = adfuller(x, maxlag=PERIODO_DIURNO, autolag=None, regression="c")[:2]
        kpss_estat, kpss_p = kpss(x, regression="c", nlags="auto")[:2]

    adf_ok = adf_p < 0.05
    kpss_ok = kpss_p >= 0.05

    if adf_ok and kpss_ok:
        conclusao = "estacionaria"
    elif (not adf_ok) and (not kpss_ok):
        conclusao = "nao_estacionaria"
    else:
        conclusao = "inconclusiva"

    return {
        "adf_estatistica": _num(adf_estat),
        "adf_p": _num(adf_p, 6),
        "kpss_estatistica": _num(kpss_estat),
        "kpss_p": _num(kpss_p, 6),
        "conclusao": conclusao,
    }


@app.route('/processarARIMA', methods=['POST'])
def processar_dados_arima():
    """
    Etapa de identificação do ARIMA (Box-Jenkins), sobre a série agregada em média horária:
    - decomposição STL: tendência + sazonalidade diurna + resíduo (ruído)
    - testes de estacionariedade (ADF e KPSS) na série e na 1ª diferença
    - sugestão da ordem de diferenciação d
    """
    try:
        dados = request.get_json()
        df = pd.DataFrame(dados)

        colunas = ['year', 'month', 'day', 'hour', 'minute', 'ws100']
        if not all(c in df.columns for c in colunas):
            return jsonify({"erro": "Dados incompletos para a análise."}), 400

        tempo = pd.to_datetime(df[['year', 'month', 'day', 'hour', 'minute']], errors='coerce')
        serie = pd.Series(pd.to_numeric(df['ws100'], errors='coerce').to_numpy(), index=tempo)
        serie = serie[serie.index.notna()].dropna()
        serie = serie[~serie.index.duplicated(keep='first')].sort_index()

        if len(serie) < 2:
            return jsonify({"erro": "Poucos dados válidos para a análise."}), 400

        # A análise assume amostragem de até 1 hora (10 min ou horária)
        intervalo = serie.index.to_series().diff().median()
        if pd.notna(intervalo) and intervalo > pd.Timedelta(hours=1):
            return jsonify({
                "erro": "Esta análise exige dados com intervalo de até 1 hora (por exemplo, 10 minutos ou horários)."
            }), 400

        # Média horária (a sazonalidade diurna passa a ter período 24)
        horaria = serie.resample('1h').mean()

        if len(horaria) < MIN_HORAS:
            return jsonify({"erro": "Série muito curta: são necessários pelo menos 14 dias de dados."}), 400

        faltantes = int(horaria.isna().sum())
        percentual_interpolado = faltantes / len(horaria) * 100
        # O STL não aceita lacunas: preenche por interpolação linear no tempo
        horaria = horaria.interpolate(method='time', limit_direction='both')

        # ───────── Decomposição STL ─────────
        stl = STL(horaria, period=PERIODO_DIURNO, trend=JANELA_TENDENCIA, robust=False).fit()
        tendencia, sazonal, residuo = stl.trend, stl.seasonal, stl.resid

        var_residuo = float(np.var(residuo))
        forca_tendencia = max(0.0, 1 - var_residuo / float(np.var(tendencia + residuo)))
        forca_sazonal = max(0.0, 1 - var_residuo / float(np.var(sazonal + residuo)))
        ruido_pct = var_residuo / float(np.var(horaria)) * 100

        # ───────── Estacionariedade ─────────
        original = _testar_estacionariedade(horaria.to_numpy())
        diferenciada = _testar_estacionariedade(np.diff(horaria.to_numpy()))
        d_sugerido = 0 if original["conclusao"] == "estacionaria" else 1

        # ───────── Série reduzida só para exibição ─────────
        passo = max(1, int(np.ceil(len(horaria) / MAX_PONTOS_EXIBICAO)))
        indice = horaria.index[::passo]
        t_ms = ((indice - pd.Timestamp("1970-01-01")) // pd.Timedelta(milliseconds=1)).tolist()

        def reduzir(s):
            return [_num(v, 3) for v in s.iloc[::passo]]

        return jsonify({
            "periodo": PERIODO_DIURNO,
            "n_horas": int(len(horaria)),
            "inicio": horaria.index[0].strftime('%Y-%m-%d %H:%M'),
            "fim": horaria.index[-1].strftime('%Y-%m-%d %H:%M'),
            "percentual_interpolado": _num(percentual_interpolado, 2),
            "passo_exibicao": passo,
            "t": t_ms,
            "observada": reduzir(horaria),
            "tendencia": reduzir(tendencia),
            "sazonal": reduzir(sazonal),
            "residuo": reduzir(residuo),
            "metricas": {
                "forca_tendencia": _num(forca_tendencia, 3),
                "forca_sazonalidade": _num(forca_sazonal, 3),
                "ruido_pct": _num(ruido_pct, 2),
            },
            "estacionariedade": {
                "original": original,
                "diferenciada": diferenciada,
                "d_sugerido": d_sugerido,
            },
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)