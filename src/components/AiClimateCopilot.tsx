import { useState } from "preact/hooks";
import {
  FortyGuardEnvParamsResult,
  FortyGuardHeatmapResult,
} from "../services/types";
import {
  runThermalAgent,
  ThermalAgentResult,
} from "../agent/thermalAgent";

interface AiClimateCopilotProps {
  heatmap: FortyGuardHeatmapResult;
  envParams: FortyGuardEnvParamsResult;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

function formatAgentResult(result: ThermalAgentResult): string {
  const findings = result.findings
    .map(
      (finding) =>
        `• ${finding.metric}: ${finding.value} — ${finding.interpretation}`,
    )
    .join("\n");

  const recommendations = result.recommendations
    .map(
      (recommendation, index) =>
        `${index + 1}. ${recommendation.recommendation}\n   Reason: ${recommendation.reason}`,
    )
    .join("\n");

  return `${result.summary}

Risk level: ${result.riskLevel.toUpperCase()}

Baseline:
• Mean temperature: ${result.baseline.meanTemperatureC}°C
• Maximum temperature: ${result.baseline.maxTemperatureC}°C
• Minimum temperature: ${result.baseline.minTemperatureC}°C
• Heat exposure score: ${result.baseline.heatExposureScore}/100

FortyGuard findings:
${findings}

Recommended design actions:
${recommendations}`;
}

export default function AiClimateCopilot({
  heatmap,
  envParams,
}: AiClimateCopilotProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      sender: "ai",
      text:
        "I am your Residential Heat Design Agent. I can analyse the current FortyGuard thermal data and identify design changes that may reduce heat exposure.",
      timestamp: "Just now",
    },
  ]);

  const quickPrompts = [
    "Analyse the current heat exposure",
    "What design changes should we consider?",
    "Which intervention should we prioritise?",
  ];

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();

    if (!text || isThinking) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((previous) => [...previous, userMessage]);
    setInputQuery("");
    setIsThinking(true);

    try {
      const result = await runThermalAgent({
        heatmap,
        envParams,
        userQuestion: text,
      });

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: formatAgentResult(result),
        timestamp: "Just now",
      };

      setMessages((previous) => [...previous, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: "ai",
        text:
          `I could not analyse the thermal data.\n\n` +
          `${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: "Just now",
      };

      setMessages((previous) => [...previous, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div class="ai-copilot-card">
      <div class="ai-header">
        <div class="ai-title">
          <span>🤖</span> Residential Heat Design Agent
        </div>

        <span class="ai-badge">FortyGuard-powered</span>
      </div>

      <div class="quick-prompts-container">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            type="button"
            class="prompt-chip"
            onClick={() => handleSend(prompt)}
            disabled={isThinking}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div class="chat-messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            class={`chat-msg ${
              message.sender === "ai" ? "msg-ai" : "msg-user"
            }`}
          >
            <div class="msg-bubble">
              <div class="msg-sender">
                {message.sender === "ai" ? "🌡️ Heat Design Agent" : "You"}
              </div>

              <div class="msg-text" style="white-space: pre-wrap">
                {message.text}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div class="chat-msg msg-ai">
            <div class="msg-bubble">
              <div class="msg-sender">🌡️ Heat Design Agent</div>
              <div class="msg-text">Analysing FortyGuard data...</div>
            </div>
          </div>
        )}
      </div>

      <form
        class="chat-input-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          placeholder="Ask about heat exposure or design..."
          value={inputQuery}
          onInput={(event) =>
            setInputQuery((event.target as HTMLInputElement).value)
          }
          class="chat-text-input"
          disabled={isThinking}
        />

        <button
          type="submit"
          class="chat-send-btn"
          disabled={!inputQuery.trim() || isThinking}
        >
          {isThinking ? "..." : "Ask"}
        </button>
      </form>
    </div>
  );
}