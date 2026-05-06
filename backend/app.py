
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "It's Working!"

@app.route('/processar', methods=['POST'])
def processar_dados():
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

@app.route('/dfa', methods=['POST'])
def calcular_dfa():
    # Baseado no repositório fathon (https://github.com/stfbnc/fathon)
    try:
        dados = request.get_json()
        df = pd.DataFrame(dados)

        # Pega só a velocidade e remove NaNs
        serie = df['ws100'].dropna().astype(float).values

        # 1. toAggregated: subtrai média e soma cumulativa
        serie_agg = np.nancumsum(serie - np.nanmean(serie))

        # 2. Tamanhos de janela (winSizes)
        n_min = 10
        n_max = len(serie_agg) // 4  # regra geral para DFA
        winSizes = np.unique(np.logspace(
            np.log10(n_min), np.log10(n_max), num=40
        ).astype(int))

        # 3. computeFlucVec: calcula F(n) para cada janela
        F = []
        n_vals = []
        pol_ord = 1  # DFA-1

        for n in winSizes:
            num_seg = len(serie_agg) // n
            if num_seg < 2:
                continue

            residuos = []
            for s in range(num_seg):
                seg = serie_agg[s*n:(s+1)*n]
                x = np.arange(n)
                # Ajusta polinômio (detrending)
                coef = np.polyfit(x, seg, pol_ord)
                tendencia = np.polyval(coef, x)
                residuos.append(np.mean((seg - tendencia) ** 2))

            F_n = np.sqrt(np.mean(residuos))
            F.append(F_n)
            n_vals.append(n)

        n_vals = np.array(n_vals)
        F = np.array(F)

        # 4. fitFlucVec: regressão linear em log-log → expoente H
        ln_n = np.log(n_vals)
        ln_F = np.log(F)
        coef = np.polyfit(ln_n, ln_F, 1)
        H = coef[0]
        H_intercept = coef[1]

        # Linha de ajuste
        ln_F_fit = H_intercept + H * ln_n

        return jsonify({
            "scales": n_vals.tolist(),       # valores brutos de n
            "fluct": F.tolist(),             # valores brutos de F(n)
            "ln_n": ln_n.tolist(),
            "ln_F": ln_F.tolist(),
            "ln_F_fit": ln_F_fit.tolist(),
            "H": round(float(H), 4),
            "r2": float(np.corrcoef(ln_n, ln_F)[0, 1] ** 2)  # R² do ajuste
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)