import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import { processWindRoseData } from "./WindRoseUtils";

const COLORS = [
  "#CAF0F8",
  "#90E0EF",
  "#84CAE4",
  "#0096C7",
  "#023E8A",
  "#03045E"
];

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

// Raio máximo da rosa dos ventos em METROS (equivalente ao "maxRadius" em
// pixels da versão SVG, só que agora em distância real no terreno).
const MAX_RADIUS_METERS = 400;

// Espessura fixa (em metros) de cada pétala — é só um efeito visual 3D,
// o valor em si continua sendo representado pelo RAIO, igual no gráfico 2D.
const PETAL_THICKNESS_METERS = 5;

// Quanto flutuar acima do terreno (em metros) para não "afundar" no relevo.
const FLOAT_OFFSET_METERS = 8;

// Quantos segmentos usar para desenhar o arco de cada pétala (mais
// segmentos = curva mais suave, já que agora é geometria real, não SVG).
const ARC_SEGMENTS = 6;

const EARTH_RADIUS = 6378137; // metros

// O Cesium.Terrain carrega os dados de forma assíncrona: logo após criar
// o Viewer, viewer.terrainProvider ainda pode estar indefinido. Essa função
// devolve uma Promise que só resolve quando o terreno estiver realmente
// pronto para uso (ex: em sampleTerrainMostDetailed).
function waitForTerrainReady(terrain) {
  return new Promise((resolve, reject) => {
    if (terrain.ready) {
      resolve(terrain.provider);
      return;
    }

    const removeReadyListener = terrain.readyEvent.addEventListener((provider) => {
      removeReadyListener();
      resolve(provider);
    });

    const removeErrorListener = terrain.errorEvent.addEventListener((error) => {
      removeErrorListener();
      reject(error);
    });
  });
}

// Calcula um ponto de destino a partir de uma coordenada, um rumo
// (bearing, em graus, 0 = Norte, sentido horário) e uma distância (metros).
// Fórmula padrão de "destination point given distance and bearing".
function destinationPoint(lat, lon, bearingDeg, distanceMeters) {
  const δ = distanceMeters / EARTH_RADIUS;
  const θ = Cesium.Math.toRadians(bearingDeg);

  const φ1 = Cesium.Math.toRadians(lat);
  const λ1 = Cesium.Math.toRadians(lon);

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) +
    Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );

  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
  );

  return {
    lat: Cesium.Math.toDegrees(φ2),
    lon: Cesium.Math.toDegrees(λ2)
  };
}

// Constrói e adiciona ao viewer todas as entidades (pétalas) da rosa
// dos ventos 3D, a partir do chartData já processado pelo WindRoseUtils.
function buildWindRoseEntities(viewer, chartData, lat, lon, groundHeight) {

  const baseHeight = groundHeight + FLOAT_OFFSET_METERS;
  const topHeight = baseHeight + PETAL_THICKNESS_METERS;

  const maxValue = Math.max(1, ...chartData.flat().map(Number));

  chartData.forEach((directionData, directionIndex) => {

    // Bearing central da direção (N=0°, NE=45°, E=90°... igual ao
    // ângulo usado no SVG, mas agora como rumo geográfico real)
    const centerBearing = directionIndex * 45;
    const startBearing = centerBearing - 18;
    const endBearing = centerBearing + 18;

    let accumulatedRadius = 0;

    directionData.forEach((value, speedIndex) => {

      if (!value || Number(value) <= 0) return;

      const petalRadius = (Number(value) / maxValue) * MAX_RADIUS_METERS;
      const startRadius = accumulatedRadius;
      accumulatedRadius += petalRadius;
      const endRadius = accumulatedRadius;

      // Gera pontos ao longo do arco externo e do arco interno,
      // formando um "anel" (mesma lógica do path SVG original,
      // só que amostrando vários pontos pra curva ficar suave).
      const outerArcPoints = [];
      const innerArcPoints = [];

      for (let i = 0; i <= ARC_SEGMENTS; i++) {
        const t = i / ARC_SEGMENTS;
        const bearing = startBearing + (endBearing - startBearing) * t;

        const outer = destinationPoint(lat, lon, bearing, endRadius);
        outerArcPoints.push(outer);

        // Se startRadius for 0, o "arco interno" colapsa no próprio
        // centro (estação) — ainda funciona, só vira um ponto único.
        const inner = destinationPoint(lat, lon, bearing, startRadius);
        innerArcPoints.push(inner);
      }

      // Hierarquia do polígono: vai pelo arco externo (início ao fim)
      // e volta pelo arco interno (fim ao início), fechando a forma.
      const polygonPoints = [
        ...outerArcPoints,
        ...innerArcPoints.reverse()
      ];

      const hierarchyPositions = Cesium.Cartesian3.fromDegreesArray(
        polygonPoints.flatMap((p) => [p.lon, p.lat])
      );

      viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(hierarchyPositions),
          height: baseHeight,
          extrudedHeight: topHeight,
          material: Cesium.Color.fromCssColorString(COLORS[speedIndex]).withAlpha(0.75),
          outline: true,
          outlineColor: Cesium.Color.WHITE.withAlpha(0.6)
        }
      });
    });
  });
}

const WindRoseMap = ({
  data,
  coordinates = [-22.42, -45.45],
  height = "100%"
}) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const terrainReadyRef = useRef(null); // Promise<TerrainProvider>

  // --- Setup inicial do viewer (roda uma única vez) ---
  useEffect(() => {
    if (!containerRef.current) return;

    Cesium.Ion.defaultAccessToken = process.env.REACT_APP_CESIUM_ION_TOKEN;

    const terrain = Cesium.Terrain.fromWorldTerrain();
    terrainReadyRef.current = waitForTerrainReady(terrain);

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      shadows: false,
    });

    viewerRef.current = viewer;

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // --- Câmera + estação + rosa dos ventos: roda quando coordenadas ou dados mudam ---
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const [latitude, longitude] = coordinates;

    let cancelled = false;

    async function render() {
      // Limpa entidades antigas (estação + rosa dos ventos) antes de redesenhar
      viewer.entities.removeAll();

      // Câmera
      const cameraHeight = 1500;

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, cameraHeight),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-35),
          roll: 0,
        },
        duration: 2,
      });

      // Ponto + label da estação
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        point: {
          pixelSize: 12,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: "Estação",
          font: "14px sans-serif",
          pixelOffset: new Cesium.Cartesian2(0, -25),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });

      // Se ainda não há dados, para por aqui (só mostra terreno + estação,
      // igual ao comportamento de teste que você já tinha)
      if (!data || data.length === 0) return;

      const chartData = processWindRoseData(data);

      // Espera o terreno terminar de carregar (evita o erro
      // "terrainProvider is required" quando os dados chegam antes
      // do terreno estar pronto).
      const terrainProvider = await terrainReadyRef.current;

      if (cancelled) return;

      // Descobre a elevação real do terreno na coordenada da estação,
      // para "plantar" a rosa dos ventos na altura certa do relevo.
      const [sampledPosition] = await Cesium.sampleTerrainMostDetailed(
        terrainProvider,
        [Cesium.Cartographic.fromDegrees(longitude, latitude)]
      );

      if (cancelled) return;

      const groundHeight = sampledPosition.height || 0;

      buildWindRoseEntities(viewer, chartData, latitude, longitude, groundHeight);
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [coordinates, data]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: height,
        position: "relative",
      }}
    />
  );
};

export default WindRoseMap;