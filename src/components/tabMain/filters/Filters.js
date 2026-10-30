import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Slider } from "@mui/material";

import "./datepicker.css";

const BOX = "flex h-12 w-full items-center gap-2 rounded-lg border border-line bg-white px-3.5 shadow-sm sm:w-auto";
const LABEL = "whitespace-nowrap text-sm font-semibold text-brand";

function InfoDot({ title }) {
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className="inline-flex h-[18px] w-[18px] shrink-0 cursor-help items-center justify-center rounded-full border border-brand-border bg-brand-shadow text-xs font-bold text-brand"
    >
      i
    </span>
  );
}

// Desenho dos filtros de data e velocidade. Os estados estão no DashboardPage.
export default function Filters({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  speedRange,
  setSpeedRange,
}) {
  return (
    <>
      {/* Filtro de Data */}
      <div className={BOX}>
        <label htmlFor="filtro-data" className={LABEL}>
          Filtrar por Data:
        </label>
        <InfoDot title="Selecione o período desejado para análise. Clique primeiro na data inicial." />

        <DatePicker
          id="filtro-data"
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            setStartDate(update[0]);
            setEndDate(update[1]);
          }}
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecione um intervalo"
          isClearable
          minDate={new Date(2021, 0, 1)}
          maxDate={new Date()}
          scrollableMonthYearDropdown
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          todayButton="Hoje"
          popperPlacement="bottom"
          calendarClassName="wi-datepicker"
          popperClassName="wi-datepicker-popper"
          wrapperClassName="!flex items-center"
          className="h-8 w-52 rounded-lg border-[1.5px] border-brand-border bg-white px-3 text-sm text-brand shadow-sm outline-none transition focus:border-brand"
        />
      </div>

      {/* Filtro de Velocidade */}
      <div className={BOX}>
        <span className={LABEL}>Filtrar por Velocidade (m/s):</span>
        <InfoDot title="Arraste as extremidades do filtro para selecionar as velocidades desejadas." />

        <Slider
          value={speedRange}
          onChange={(event, newValue) => setSpeedRange(newValue)}
          getAriaLabel={(index) =>
            index === 0 ? "Velocidade mínima" : "Velocidade máxima"
          }
          valueLabelDisplay="auto"
          min={0}
          max={20}
          step={0.1}
          sx={{
            width: 140,
            marginX: 1,
            "& .MuiSlider-thumb": {
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#1a237e",
              border: "2px solid #fff",
              boxShadow: "0 1px 4px rgba(26,35,126,0.45)",
            },
            "& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible": {
              boxShadow: "0 0 0 6px rgba(7,66,230,0.16)",
            },
            "& .MuiSlider-track": { color: "#0742e6" },
            "& .MuiSlider-rail": { color: "#b3c8f9" },
          }}
        />

        <button
          type="button"
          onClick={() => setSpeedRange([0, 20])}
          title="Retornar filtro de velocidade ao valor inicial"
          aria-label="Retornar filtro de velocidade ao valor inicial"
          className="rounded p-0.5 text-brand transition hover:bg-brand-soft"
        >
          {/* Ícone "desfazer" */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
          </svg>
        </button>
      </div>
    </>
  );
}