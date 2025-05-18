import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import { view } from "@forge/bridge";
import HomePage from "./pages/HomePage";
import WorklogPage from "./pages/WorklogPage";
import DailyWorklogPage from "./pages/DailyWorklogPage";


function App() {
    const [history, setHistory] = useState(null);

    useEffect(() => {
        view.createHistory().then((newHistory) => {
            setHistory(newHistory);
        });
    }, []);

    const [historyState, setHistoryState] = useState(null);

    useEffect(() => {
        if (!historyState && history) {
            setHistoryState({
                action: history.action,
                location: history.location,
            });
        }
    }, [history, historyState]);

    useEffect(() => {
        if (history) {
            history.listen((location, action) => {
                setHistoryState({
                    action,
                    location,
                });
            });
        }
    }, [history]);

    return (
        <div>
            {history && historyState ? (
                <Router
                    navigator={history}
                    navigationType={historyState.action}
                    location={historyState.location}
                >
                    <Routes>
                        <Route path="/task-estimate" element={<HomePage />}></Route>
                        <Route path="/worklog" element={<WorklogPage />}></Route>
                        <Route path="/daily-worklog" element={<DailyWorklogPage />}></Route>
                    </Routes>
                </Router>
            ) : (
                "Loading..."
            )}
        </div>
    );
}

export default App;
