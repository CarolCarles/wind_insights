// Calcula a média vetorial da direção do vento
export function mediaDirecao(direcoes, velocidades) {
  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < direcoes.length; i++) {
    const rad = (direcoes[i] * Math.PI) / 180;

    sumX += velocidades[i] * Math.cos(rad);
    sumY += velocidades[i] * Math.sin(rad);
  }

  const mediaRad = Math.atan2(sumY, sumX);

  let mediaGraus = (mediaRad * 180) / Math.PI;

  if (mediaGraus < 0) {
    mediaGraus += 360;
  }

  return {
    direcao: mediaGraus,
    rad: mediaRad
  };
}


// Processa os dados para a Rosa dos Ventos
export function processWindRoseData(data) {
  if (!data || data.length === 0) {
    return [];
  }

  // 1. Agrupar por hora
  const agrupadoPorHora = {};

  data.forEach((d) => {
    let dateStr = d.id || d.data || d.date;

    if (!dateStr) return;

    let [dia, hora] = dateStr.split(/[ T]/);

    if (!hora) return;

    hora = hora.slice(0, 2);

    const chave = `${dia} ${hora}`;

    const ws = Number(d.ws100);
    const wd = Number(d.wdir100);

    if (!isNaN(ws) && !isNaN(wd)) {
      if (!agrupadoPorHora[chave]) {
        agrupadoPorHora[chave] = {
          velocidades: [],
          direcoes: []
        };
      }

      agrupadoPorHora[chave].velocidades.push(ws);
      agrupadoPorHora[chave].direcoes.push(wd);
    }
  });


  // 2. Calcular médias por hora
  const medias = Object.keys(agrupadoPorHora).map((chave) => {
    const { velocidades, direcoes } = agrupadoPorHora[chave];

    const mediaVel =
      velocidades.reduce((a, b) => a + b, 0) /
      velocidades.length;

    const { direcao } = mediaDirecao(
      direcoes,
      velocidades
    );

    return {
      ws: mediaVel,
      wd: direcao
    };
  });


  // 3. Direções e faixas de velocidade
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const windSpeedRanges = [2, 4, 6, 8, 10, 12];

  // Inicializar frequências
  const frequencyData = directions.reduce(
    (acc, direction) => {
      acc[direction] =
        Array(windSpeedRanges.length).fill(0);

      return acc;
    },
    {}
  );


  // 4. Processar médias horárias
  medias.forEach((row) => {
    const direction = row.wd;
    const speed = row.ws;

    if (isNaN(direction) || isNaN(speed)) return;

    let directionKey = null;

    if (
      (direction >= 337.5 && direction <= 360) ||
      (direction >= 0 && direction < 22.5)
    ) {
      directionKey = "N";
    } else if (direction >= 22.5 && direction < 67.5) {
      directionKey = "NE";
    } else if (direction >= 67.5 && direction < 112.5) {
      directionKey = "E";
    } else if (direction >= 112.5 && direction < 157.5) {
      directionKey = "SE";
    } else if (direction >= 157.5 && direction < 202.5) {
      directionKey = "S";
    } else if (direction >= 202.5 && direction < 247.5) {
      directionKey = "SW";
    } else if (direction >= 247.5 && direction < 292.5) {
      directionKey = "W";
    } else if (direction >= 292.5 && direction < 337.5) {
      directionKey = "NW";
    }


    // Faixa de velocidade
    let speedRangeIndex = -1;

    for (let i = 0; i < windSpeedRanges.length - 1; i++) {
      if (
        speed >= windSpeedRanges[i] &&
        speed < windSpeedRanges[i + 1]
      ) {
        speedRangeIndex = i;
        break;
      }
    }

    if (
      speed >= windSpeedRanges[windSpeedRanges.length - 1]
    ) {
      speedRangeIndex =
        windSpeedRanges.length - 1;
    }


    // Incrementar frequência
    if (
      directionKey &&
      speedRangeIndex !== -1
    ) {
      frequencyData[directionKey][speedRangeIndex]++;
    }
  });


  // 5. Calcular percentuais
  const formattedData = directions.map(
    (direction) => {
      const total =
        frequencyData[direction].reduce(
          (sum, value) => sum + value,
          0
        );

      return frequencyData[direction].map(
        (value) =>
          total > 0
            ? Number(((value / total) * 100).toFixed(2))
            : 0
      );
    }
  );

  return formattedData;
}