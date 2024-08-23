import React from "react";
import { ethers } from "ethers";
import { useReportsQuery } from "./generated/graphql";
import "./style.css"; 

type Report = {
    id: string;
    index: number;
    input: any;
    payload: string;
};

export const Reports: React.FC = () => {
    const [result, reexecuteQuery] = useReportsQuery();
    const { data, fetching, error } = result;

    if (fetching) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">Oh no... {error.message}</p>;

    if (!data || !data.reports) return <p className="noReports">No reports</p>;

    const reports: Report[] = data.reports.edges.map((node: any) => {
        const n = node.node;
        let inputPayload = n?.input.payload;
        if (inputPayload) {
            try {
                inputPayload = ethers.utils.toUtf8String(inputPayload);
            } catch (e) {
                inputPayload = inputPayload + " (hex)";
            }
        } else {
            inputPayload = "(empty)";
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
    }).sort((b: any, a: any) => {
        if (a.input.index === b.input.index) {
            return b.index - a.index;
        } else {
            return b.input.index - a.input.index;
        }
    });

    return (
        <div className="container">
            <button onClick={() => reexecuteQuery({ requestPolicy: 'network-only' })} className="button">
                Reload
            </button>
            <table className="table">
                <thead>
                    <tr>
                        <th className="tableHeader">Input Index</th>
                        <th className="tableHeader">Notice Index</th>
                        <th className="tableHeader">Payload</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.length === 0 && (
                        <tr>
                            <td colSpan={3} className="noReportsRow">No reports</td>
                        </tr>
                    )}
                    {reports.map((n: any) => (
                        <tr key={`${n.input.index}-${n.index}`} className="tableRow">
                            <td className="tableCell">{n.input.index}</td>
                            <td className="tableCell">{n.index}</td>
                            <td className="tableCell">{n.payload}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
