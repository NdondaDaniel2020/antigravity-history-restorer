#!/usr/bin/env python3
"""
Restaurador Automático de Histórico do Antigravity IDE
Varre a pasta ~/.gemini/antigravity-ide/conversations e reindexa
todos os chats no Language Server ativo do editor.
"""

import os
import re
import glob
import json
import urllib.request
import subprocess

def get_language_server_credentials():
    try:
        ps_out = subprocess.check_output(
            "ps aux | grep language_server | grep -v grep", shell=True
        ).decode()
    except subprocess.CalledProcessError:
        print("[-] Erro: O Antigravity IDE não parece estar em execução.")
        return None, []

    csrf_match = re.search(r"--csrf_token\s+([a-f0-9\-]+)", ps_out)
    csrf = csrf_match.group(1) if csrf_match else None

    # Descobre as portas em modo LISTEN abertas pelo language server
    ports = []
    try:
        lsof_out = subprocess.check_output(
            "lsof -i -P -n | grep language_", shell=True
        ).decode()
        for line in lsof_out.splitlines():
            if "LISTEN" in line and "127.0.0.1:" in line:
                m = re.search(r"127\.0\.0\.1:(\d+)", line)
                if m:
                    ports.append(int(m.group(1)))
    except Exception as e:
        print(f"[-] Erro ao listar portas: {e}")

    return csrf, list(set(ports))

def restore_conversations():
    conv_dir = os.path.expanduser("~/.gemini/antigravity-ide/conversations")
    if not os.path.exists(conv_dir):
        print(f"[-] Diretório não encontrado: {conv_dir}")
        return

    db_files = glob.glob(os.path.join(conv_dir, "*.db"))
    cids = [os.path.basename(f).replace(".db", "") for f in db_files]

    if not cids:
        print("[-] Nenhuma conversa encontrada na pasta.")
        return

    print(f"[*] Encontradas {len(cids)} conversas no disco.")

    csrf, ports = get_language_server_credentials()
    if not csrf or not ports:
        print("[-] Não foi possível autenticar com o Language Server do Antigravity.")
        return

    print(f"[*] Conectando ao Language Server (Portas ativas: {ports})...")

    success_count = 0
    for cid in cids:
        for port in ports:
            url = f"http://127.0.0.1:{port}/exa.language_server_pb.LanguageServerService/GetCascadeTrajectorySteps"
            payload = json.dumps({"cascadeId": cid, "startIndex": 0, "endIndex": 2}).encode("utf-8")
            headers = {
                "Content-Type": "application/json",
                "Connect-Protocol-Version": "1",
                "X-Codeium-Csrf-Token": csrf
            }
            try:
                req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=1.5) as resp:
                    if resp.status == 200:
                        success_count += 1
                        break
            except Exception:
                continue

    print(f"[+] Sucesso! {success_count}/{len(cids)} conversas foram reindexadas com sucesso.")
    print("[+] Abra o menu 'Search all convos...' ou o histórico do Agent para vê-las!")

if __name__ == "__main__":
    restore_conversations()
