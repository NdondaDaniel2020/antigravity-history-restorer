import * as vscode from "vscode";
import { detectLanguageServer } from "./detector";
import { listConversationIds, awakenConversation } from "./restorer";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "antigravityHistoryRestorer.restore",
    async () => {
      const cids = listConversationIds();
      if (cids.length === 0) {
        vscode.window.showWarningMessage(
          "Antigravity History Restorer: Nenhuma conversa (.db/.pb) foi encontrada em ~/.gemini/antigravity-ide/conversations."
        );
        return;
      }

      const server = detectLanguageServer();
      if (!server || server.ports.length === 0) {
        vscode.window.showErrorMessage(
          "Antigravity History Restorer: Não foi possível detectar o Language Server ativo do Antigravity. Certifique-se de que o editor está em execução."
        );
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Restaurando histórico de conversas do Antigravity...",
          cancellable: true,
        },
        async (progress, token) => {
          let restored = 0;
          let failed = 0;
          const total = cids.length;

          for (let i = 0; i < total; i++) {
            if (token.isCancellationRequested) {
              vscode.window.showInformationMessage(
                `Restauração cancelada pelo usuário. (${restored} recuperadas)`
              );
              return;
            }

            const cid = cids[i];
            const ok = await awakenConversation(server, cid);
            if (ok) {
              restored++;
            } else {
              failed++;
            }

            progress.report({
              message: `${i + 1} de ${total} (${restored} recuperadas)`,
              increment: (1 / total) * 100,
            });
          }

          const action = await vscode.window.showInformationMessage(
            `Sucesso! ${restored} conversas foram restauradas no Antigravity IDE.`,
            "Abrir Busca de Conversas",
            "Recarregar Janela"
          );

          if (action === "Abrir Busca de Conversas") {
            // Trigger conversation picker if available
            vscode.commands.executeCommand("antigravity.openConversationPicker").then(
              () => {},
              () => {
                vscode.commands.executeCommand("workbench.action.quickOpen");
              }
            );
          } else if (action === "Recarregar Janela") {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          }
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
