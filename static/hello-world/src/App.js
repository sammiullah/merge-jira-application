import React, { useEffect, useState } from 'react';
import { mergeJson } from './merge-service.js';

const baseTemplate = `{
  "Variables": __Variables__,
  "VersionId": 0,
  "FlowItems": __FlowItems__,
  "FlowStates": __FlowStates__,
  "FlowSections": __FlowSections__,
  "EventTriggerLinks": __EventTriggerLinks__,
  "SessionTimeoutInMinutes": __SessionTimeoutInMinutes__,
  "InitialState": __InitialState__,
  "InitialCardholderState": __InitialCardholderState__,
  "InitialDtmfFlowValue": __InitialDtmfFlowValue__,
  "ExternalTelephony": __ExternalTelephony__,
  "UsesPostSessionScreen": __UsesPostSessionScreen__,
  "IsMarkdownEnabled": __IsMarkdownEnabled__,
  "AlternativeRenderingMode": __AlternativeRenderingMode__,
  "SecureCallUponLinking": __SecureCallUponLinking__,
  "LinkIdPrefix": __LinkIdPrefix__,
  "LinkIdEnabled": __LinkIdEnabled__,
  "Styling": __Styling__,
  "FrameAncestors": __FrameAncestors__,
  "FlowInterface": __FlowInterface__
}`;

const DARK_PRIMARY = '#da6717';
const LIGHT_PRIMARY = '#1a1d34';

const DARK_SECONDARY = '#94a3b8';
const LIGHT_SECONDARY = '#475569';

const DARK_BACKGROUND = '#1f1f21';
const LIGHT_BACKGROUND = '#ffffff';

const DARK_CARD_BACKGROUND = '#1f1f21';
const LIGHT_CARD_BACKGROUND = '#ffffff';

const DARK_FIELD_BACKGROUND = '#1f1f21';
const LIGHT_FIELD_BACKGROUND = '#ffffff';

const DARK_BORDER_COLOR = '#3a3a3f';
const LIGHT_BORDER_COLOR = '#cbd5e1';

const DARK_LABEL_COLOR = '#f8fafc';
const LIGHT_LABEL_COLOR = '#0f172a';

function App() {
    const [flow1, setFlow1] = useState('');
    const [flow2, setFlow2] = useState('');
    const [result, setResult] = useState('');
    const [copyLabel, setCopyLabel] = useState('Copy');
    const [message, setMessage] = useState('Paste both flows, merge them, then copy the result.');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const canCopy = result.trim().length > 0;
    const primaryColor = isDarkMode ? DARK_PRIMARY : LIGHT_PRIMARY;
    const secondaryColor = isDarkMode ? DARK_SECONDARY : LIGHT_SECONDARY;
    const labelColor = isDarkMode ? DARK_LABEL_COLOR : LIGHT_LABEL_COLOR;
    const pageBackground = isDarkMode ? DARK_BACKGROUND : LIGHT_BACKGROUND;
    const cardBackground = isDarkMode ? DARK_CARD_BACKGROUND : LIGHT_CARD_BACKGROUND;
    const fieldBackground = isDarkMode ? DARK_FIELD_BACKGROUND : LIGHT_FIELD_BACKGROUND;
    const borderColor = isDarkMode ? DARK_BORDER_COLOR : LIGHT_BORDER_COLOR;

    useEffect(() => {
        if (!message || message === 'Paste both flows, merge them, then copy the result.') {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setMessage('Paste both flows, merge them, then copy the result.');
        }, 1800);

        return () => window.clearTimeout(timeoutId);
    }, [message]);

    const updateMessage = (text) => {
        setMessage(text);
    };

    const handleMerge = (event) => {
        event.preventDefault();

        if (!flow1.trim() || !flow2.trim()) {
            updateMessage('Please paste valid JSON in both Flow 1 and Flow 2.');
            return;
        }

        try {
            const merged = mergeJson(flow1, flow2, baseTemplate);
            setResult(merged);
            setCopyLabel('Copy');
            updateMessage('Merge complete. Review the output or copy it.');
        } catch (error) {
            setCopyLabel('Copy');
            updateMessage(`Merge failed: ${error.message}`);
        }
    };

    const handleCopy = async () => {
        if (!result) {
            updateMessage('Nothing to copy yet.');
            return;
        }

        try {
            await navigator.clipboard.writeText(result);
            setCopyLabel('Copied');
            updateMessage('Result copied to clipboard.');
        } catch (error) {
            setCopyLabel('Copy failed');
            updateMessage('Copy failed. Use the browser permissions or select the text manually.');
        }
    };

    const handleClear = () => {
        setFlow1('');
        setFlow2('');
        setResult('');
        setCopyLabel('Copy');
        updateMessage('Fields cleared.');
    };

    const toggleTheme = () => {
        setIsDarkMode((previousMode) => !previousMode);
    };

    return (
        <>
            <div className="pointer-events-none absolute inset-0 -z-10" />

            <div className="w-full rounded-none border p-5 shadow-panel backdrop-blur-xl sm:p-8 lg:p-10" style={{ borderColor, backgroundColor: cardBackground }}>
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div
                            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                            style={{
                                borderColor: `${primaryColor}66`,
                                backgroundColor: `${primaryColor}1a`,
                                color: primaryColor
                            }}
                        >
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                            Flow Merger v0.1
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4"
                        style={{ borderColor: `${primaryColor}88`, color: primaryColor, backgroundColor: fieldBackground }}
                    >
                        {isDarkMode ? 'Light mode' : 'Dark mode'}
                    </button>
                </div>

                <form className="space-y-6" onSubmit={handleMerge}>
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="group rounded-3xl border p-5 shadow-sm transition hover:shadow-md" style={{ borderColor, backgroundColor: cardBackground }}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <span className="block text-sm font-semibold" style={{ color: labelColor }}>Flow 1</span>
                                    <p className="mt-1 text-xs" style={{ color: labelColor }}>Primary input for the first flow segment.</p>
                                </div>
                                <span
                                    className="rounded-full px-3 py-1 text-xs font-semibold"
                                    style={{ backgroundColor: `${primaryColor}1f`, color: primaryColor }}
                                >
                                    {flow1.length} chars
                                </span>
                            </div>
                            <textarea
                                className="min-h-[280px] w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:ring-4"
                                style={{ borderColor, backgroundColor: fieldBackground, color: labelColor }}
                                value={flow1}
                                onChange={(event) => setFlow1(event.target.value)}
                                placeholder="Paste Flow 1 content here"
                            />
                        </label>

                        <label className="group rounded-3xl border p-5 shadow-sm transition hover:shadow-md" style={{ borderColor, backgroundColor: cardBackground }}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <span className="block text-sm font-semibold" style={{ color: labelColor }}>Flow 2</span>
                                    <p className="mt-1 text-xs" style={{ color: labelColor }}>Secondary input used in the final merge.</p>
                                </div>
                                <span
                                    className="rounded-full px-3 py-1 text-xs font-semibold"
                                    style={{ backgroundColor: `${primaryColor}1f`, color: primaryColor }}
                                >
                                    {flow2.length} chars
                                </span>
                            </div>
                            <textarea
                                className="min-h-[280px] w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:ring-4"
                                style={{ borderColor, backgroundColor: fieldBackground, color: labelColor }}
                                value={flow2}
                                onChange={(event) => setFlow2(event.target.value)}
                                placeholder="Paste Flow 2 content here"
                            />
                        </label>

                    </div>

                    <div className="flex flex-col items-stretch justify-between gap-3 rounded-3xl border p-4 shadow-sm sm:flex-row sm:items-center sm:px-5 sm:py-4" style={{ borderColor, backgroundColor: cardBackground }}>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="inline-flex items-center justify-center rounded-full border px-7 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4"
                            style={{ borderColor: `${primaryColor}88`, color: labelColor, backgroundColor: fieldBackground }}
                        >
                            Clear all
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-4"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Merge flows
                        </button>
                    </div>

                    <section className="rounded-3xl border p-4 shadow-sm sm:p-5" style={{ borderColor, backgroundColor: cardBackground }}>
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-semibold" style={{ color: labelColor }}>Merged Result</h2>
                                    <span
                                        className="rounded-full px-3 py-1 text-xs font-semibold"
                                        style={{ backgroundColor: `${primaryColor}1f`, color: primaryColor }}
                                    >
                                        {result ? 'Ready' : 'Empty'}
                                    </span>
                                </div>
                               
                            </div>

                            <button
                                type="button"
                                onClick={handleCopy}
                                disabled={!result}
                                className="inline-flex w-fit items-center gap-2 self-end rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ borderColor: `${primaryColor}66`, backgroundColor: fieldBackground, color: canCopy ? primaryColor : labelColor }}
                            >
                                <span aria-hidden="true">⧉</span>
                                {copyLabel}
                            </button>
                        </div>

                        <div className="rounded-3xl border p-3" style={{ borderColor, backgroundColor: fieldBackground }}>
                            <textarea
                                className="min-h-[260px] w-full resize-none rounded-2xl border border-transparent px-4 py-3 text-sm leading-6 outline-none placeholder:text-slate-400"
                                style={{ backgroundColor: fieldBackground, color: labelColor }}
                                value={result}
                                readOnly
                                placeholder="Merged result will appear here"
                            />
                        </div>

                        
                    </section>
                </form>
            </div>
        </>
    );
}

export default App;
