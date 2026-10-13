import { useEffect, useState } from "react";
import WindRoseMap from "./WindRoseMap";

const LOCAL_STORAGE_KEY = "windRose3DData";

export default function WindRoseMapPage() {
    const [payload, setPayload] = useState(null);
    const [erro, setErro] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);

            if (!raw) {
                setErro(true);
                return;
            }

            const parsed = JSON.parse(raw);

            if (!parsed || !parsed.data || parsed.data.length === 0) {
                setErro(true);
                return;
            }

            setPayload(parsed);
        } catch (e) {
            console.error("Erro ao carregar dados da rosa dos ventos 3D:", e);
            setErro(true);
        }
    }, []);

    if (erro) {
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Arial, sans-serif",
                    color: "#1a237e",
                    textAlign: "center",
                    padding: 24
                }}
            >
                <h2 style={{ marginBottom: 8 }}>Não foi possível carregar a visualização 3D</h2>
                <p>Volte para o painel principal e clique novamente em "Ver no mapa".</p>
            </div>
        );
    }

    if (!payload) {
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Arial, sans-serif",
                    color: "#1a237e"
                }}
            >
                Carregando visualização 3D...
            </div>
        );
    }

    return (
        <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
            <WindRoseMap
                data={payload.data}
                coordinates={payload.coordinates}
                height="100vh"
            />
        </div>
    );
}