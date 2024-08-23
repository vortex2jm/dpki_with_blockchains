import React, { useState } from "react";
import { useSetChain } from "@web3-onboard/react";
import { ethers } from "ethers";
import configFile from "./config.json";
import styles from "./styles/Inspect.module.css";

const config: any = configFile; // Carrega as configuracoes de blockchain a partir do arquivo JSON

export const Inspect: React.FC = () => {
  const [{ connectedChain }] = useSetChain(); // Obtem a cadeia de blockchain conectada
  const [inspectData, setInspectData] = useState<string | null>(null); // Estado para armazenar os dados a serem inspecionados
  const [reports, setReports] = useState<string[]>([]); // Estado para armazenar os relatorios obtidos
  const [metadata, setMetadata] = useState<any>({}); // Estado para armazenar metadados relacionados
  const [showReport, setShowReport] = useState<boolean>(false); // Controle de exibicao de relatorios
  const [showError, setShowError] = useState<boolean>(false); //Controle mensagens de erro

  // Funcao que realiza a inspecao de dados chamando a API
  const inspectCall = async (str: string) => {
    if (!str.trim()) { // Verifica se a string nao esta vazia
      setShowError(true);
      setShowReport(false);
      return;
    }

    let payload = str;
    if (!connectedChain) { // Verifica se ha uma cadeia conectada
      return;
    }

    let apiURL = "";

    // Define o URL da API com base na cadeia conectada
    if (config[connectedChain.id]?.inspectAPIURL) {
      apiURL = `${config[connectedChain.id].inspectAPIURL}/inspect`;
    } else {
      console.error(
        `No inspect interface defined for chain ${connectedChain.id}`
      );
      return;
    }

    try {
      // Faz a requisicao da API e processa os dados retornados
      const fetchData = await fetch(`${apiURL}/${payload}`);
      const data = await fetchData.json();

      // Atualiza os estados
      setReports(data.reports);
      setMetadata({
        metadata: data.metadata,
        status: data.status,
        exception_payload: data.exception_payload,
      });

      setShowReport(true); // Exibe os relatorios
      setShowError(false);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setShowReport(false);
      alert("oi"); // DEBUG
    }
  };

  // Funcao que lida com o upload de arquivos e processa o conteudo
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setContent: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); // Cria um FileReader para ler o conteudo
      reader.onload = (e) => {
        const content = (e.target as FileReader).result as string;
        //substituindo certos caracteres
        const modfiedContent = content
          .replace(/\n/g, "$")
          .replace(" ", "~")
          .replace("/", "!");
        console.log("Arquivo carregado:", modfiedContent);
        setContent(modfiedContent); // Armazena o conteudo modificado 
      };
      reader.readAsText(file); // Le o arquivo como texto
    }
  };

  // Funcao chamada ao clicar no botao para Inspect
  const handleButtonClick = () => {
    if (inspectData) {
      inspectCall(inspectData);
    } else {
      setShowError(true);  // Exibe mensagem de erro se nao houver dados para inspecionar
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type="file"
            accept=".pem"
            onChange={(e) => handleFileUpload(e, setInspectData)}
          />
          <button className={styles.button} onClick={handleButtonClick}>
            Enviar
          </button>
        </div>

        {showError && (
          <div className={styles.errorMessage}>
            Por favor, insira a chave pública.
          </div>
        )}

        {showReport && !showError && (
          <div className={styles.reports}>
            <h3>Reports</h3>
            <table className={styles.table}>
              <tbody>
                {reports?.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.noData}>
                      Nenhum relatório disponível
                    </td>
                  </tr>
                )}
                {reports?.map((n: any) => (
                  <tr key={`${n.payload}`} className={styles.tableRow}>
                    <td>{ethers.utils.toUtf8String(n.payload)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
