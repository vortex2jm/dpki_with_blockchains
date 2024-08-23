import React, { useEffect } from "react";
import { ethers } from "ethers";
import { useReportsQuery } from "./generated/graphql";
import styles from "./styles/Reports.module.css";

type Report = {
  id: string;
  index: number;
  input: any;
  payload: string;
};

// Executa a consulta GraphQL para obter os reports
export const Reports: React.FC = () => {
  const [result, reexecuteQuery] = useReportsQuery();
  const { data, fetching, error } = result;

  // Atualiza os relatórios a cada 5 segundos
  useEffect(() => {
    const intervalId = setInterval(() => {
      reexecuteQuery({ requestPolicy: "network-only" });
    }, 5000);

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, [reexecuteQuery]);

  // Exibe mensagens de carregamento, erro, ou ausência de dados
  if (fetching) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>Oh no... {error.message}</p>;

  if (!data || !data.reports)
    return <p className={styles.noReports}>No reports</p>;

  // Processa os dados obtidos da consulta
  const reports: Report[] = data.reports.edges
    .map((node: any) => {
      const n = node.node;
      let inputPayload = n?.input.payload;
      if (inputPayload) {
        try {
          inputPayload = ethers.utils.toUtf8String(inputPayload); // Converte o input do Payload para string UTF-8
        } catch (e) {
          inputPayload = inputPayload + " (hex)"; // Se a conversão falhar, mantém o payload em hexadecimal
        }
      } else {
        inputPayload = "(empty)"; // Marca como vazio se não houver input
      }
      let payload = n?.payload;
      if (payload) {
        try {
          payload = ethers.utils.toUtf8String(payload);
        } catch (e) {
          payload = payload + " (hex)";
        }
      } else {
        payload = "(empty)";
      }
      return {
        id: `${n?.id}`,
        index: parseInt(n?.index),
        payload: `${payload}`,
        input: n ? { index: n.input.index, payload: inputPayload } : {},
      };
    })
    .sort((b: any, a: any) => { // Ordena os reports por índice de input e de report
      if (a.input.index === b.input.index) {
        return b.index - a.index;
      } else {
        return b.input.index - a.input.index;
      }
    });

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <button
          onClick={() => reexecuteQuery({ requestPolicy: "network-only" })}
          className={styles.button}
        >
          Reload
        </button>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Input Index</th>
              <th className={styles.tableHeader}>Notice Index</th>
              <th className={styles.tableHeader}>Payload</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr>
                <td colSpan={3} className={styles.noReportsRow}>
                  No reports
                </td>
              </tr>
            )}
            {reports.map((n: any) => (
              <tr
                key={`${n.input.index}-${n.index}`}
                className={styles.tableRow}
              >
                <td className={styles.tableCell}>{n.input.index}</td>
                <td className={styles.tableCell}>{n.index}</td>
                <td className={styles.tableCell}>{n.payload}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
