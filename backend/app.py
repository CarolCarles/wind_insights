# # - - - - - - - HOLT-WINTERS - - - - - - -

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pandas as pd
# from statsmodels.tsa.holtwinters import ExponentialSmoothing

# app = Flask(__name__)
# CORS(app)

# @app.route('/') 
# def index():
#     return "It's working!"



# @app.route('/processar', methods=['POST'])
# def processar_dados():
#     try:
#         # Obtém os dados enviados no corpo da requisição
#         dados = request.get_json()
#         print("Dados recebidos:", dados)
#         df = pd.DataFrame(dados)
#         print("DataFrame criado:", df)

#         # Verifica se a coluna 'ws100' existe
#         if 'ws100' not in df.columns:
#             return jsonify({"erro": "A coluna 'ws100' não foi encontrada nos dados enviados."}), 400

#         # Aplica o modelo Holt-Winters
#         model = ExponentialSmoothing(df['ws100'], trend='add', seasonal='add', seasonal_periods=12)
#         fit = model.fit(0) 

#         # Previsão para os próximos 12 períodos
#         # forecast = fit.forecast(steps=12)

#         # Converte os resultados para JSON
#         resultado = {
#             "dados_originais": df['ws100'].tolist(),
#         }
#         return jsonify(resultado), 200

#     except Exception as e:
#         return jsonify({"erro": str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True)

# - - - - - - - MEDIA MOVEL - - - - - - -

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

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
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)