// Este arquivo contem o componente Notices que exibe uma tabela de notificacoes

import { ethers } from "ethers";
import React from "react";
import { useNoticesQuery } from "./generated/graphql";
import styles from "./styles/Notices.module.css";

type Notice = {
    id: string;
    index: number;
    input: any; // {index: number; epoch: {index: number; }}
    payload: string;
};

export const Notices: React.FC = () => {
    // Executa a consulta GraphQL para obter os notices
    const [result, reexecuteQuery] = useNoticesQuery();
    const { data, fetching, error } = result;

    // Exibe mensagens de carregamento, erro, ou ausencia de dados
    if (fetching) return <p className={styles.loading}>Loading...</p>;
    if (error) return <p className={styles.error}>Oh no... {error.message}</p>;
    if (!data || !data.notices) return <p className={styles.noNotices}>No notices</p>;

    // Processa os dados obtidos da consulta, convertendo os payloads de hexadecimal para UTF-8
    const notices: Notice[] = data.notices.edges.map((node: any) => {
        const n = node.node;
        let inputPayload = n?.input.payload;
        if (inputPayload) {
            try {
                inputPayload = ethers.utils.toUtf8String(inputPayload); // Converte o payload do input para string
            } catch (e) {
                inputPayload = inputPayload + " (hex)";  // Se a conversao falhar, mantem em hexadecimal
            }
        } else {
            inputPayload = "(empty)"; // Marca como vazio se não houver payload
        }
        let payload = n?.payload;
        if (payload) {
            try {
                payload = ethers.utils.toUtf8String(payload); // Converte o payload para string
            } catch (e) {
                payload = payload + " (hex)"; //Se nao conseguir, matem em hexadecimal
            }
        } else {
            payload = "(empty)"; //Ou como vazio
        }
        return {
            id: `${n?.id}`,
            index: parseInt(n?.index),
            payload: `${payload}`, // Armazena o payload processado
            input: n ? { index: n.input.index, payload: inputPayload } : {}, // Armazena o input e seu payload processado
        };
    }).sort((b: any, a: any) => { // Ordena os notices por indice de input e de notice
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
                    <thead className={styles.tableHeader}>
                        <tr>
                            <th>Input Index</th>
                            <th>Notice Index</th>
                            {/* <th>Input Payload</th> */}
                            <th>Payload</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                        {notices.length === 0 && (
                            <tr>
                                <td colSpan={4} className={styles.noData}>
                                    No notices
                                </td>
                            </tr>
                        )}
                        {notices.map((n: any) => (
                            <tr key={`${n.input.index}-${n.index}`} className={styles.tableRow}>
                                <td>{n.input.index}</td>
                                <td>{n.index}</td>
                                {/* <td>{n.input.payload}</td> */}
                                <td>{n.payload}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
