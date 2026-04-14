# 🔔 Gitea Notifier

Uma extensão para **Chrome** e **Firefox** que envia notificações em tempo real de atividades no seu servidor [Gitea](https://gitea.io/). Nunca mais perca um comentário, PR ou issue importante!

## ✨ Recursos

- 📬 Notificações em tempo real de atividades não lidas no Gitea
- ⚙️ Interface de configuração simples e intuitiva
- 🔐 Token seguro armazenado localmente (não é transmitido)
- ⏱️ Intervalo de verificação ajustável
- 🖱️ Clique na notificação para abrir a atividade diretamente
- 🎯 Suporta múltiplos servidores Gitea
- 🌐 Compatível com Chrome e Firefox (Manifest V3)

## 📦 Instalação

### Do Chrome Web Store (em breve)

[Link da loja]

### Instalação Local (Desenvolvimento)

1. Clone ou baixe este repositório:
```bash
git clone https://github.com/MVoikolesco/gitea-desktop-notify.git
cd gitea-desktop-notify
```

#### Google Chrome

2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o **"Modo de desenvolvedor"** (canto superior direito)
4. Clique em **"Carregar extensão sem pacote"** e selecione a pasta do projeto
5. Clique na extensão e vá para configurações

#### Mozilla Firefox

2. Abra o Firefox e vá para `about:debugging#/runtime/this-firefox`
3. Clique em **"Carregar extensão temporária..."**
4. Selecione o arquivo `manifest.json` na pasta do projeto
5. Clique na extensão e vá para configurações

> **Nota:** Extensões temporárias no Firefox são removidas ao fechar o navegador. Para instalação permanente, é necessário empacotar e assinar a extensão via [Firefox Add-ons (AMO)](https://addons.mozilla.org/developers/).

## 🚀 Como Usar

### 1. Gerar um Token no Gitea

1. Acesse seu servidor Gitea
2. Vá para **Configurações** → **Aplicações** → **Token**
3. Clique em **Gerar Novo Token**
4. Dê um nome (ex: "Gitea Notifier")
5. Selecione o escopo `notification:read`
6. Copie o token gerado

### 2. Configurar a Extensão

1. Clique no ícone da extensão na barra de ferramentas
2. Clique em **⚙️ Configurações**
3. Preencha:
   - **URL do Servidor**: `http://seu-servidor.com:3000` ou `https://seu-servidor.com`
   - **Token de Acesso**: Cole o token gerado
   - **Intervalo de Verificação**: Tempo em minutos (padrão: 0.5)
4. Clique em **🧪 Testar Conexão** para verificar
5. Clique em **💾 Salvar**

### 3. Usar

- A extensão verificará notificações automaticamente no intervalo configurado
- Você receberá notificações do navegador quando houver atividades novas
- Clique na notificação para abrir o item no Gitea

## 🔐 Segurança

- Seu token é armazenado apenas localmente no navegador
- Nunca é enviado para servidores externos
- Apenas sua máquina tem acesso às credenciais

## 💻 Desenvolvimento

### Tecnologias

- WebExtensions API (Manifest V3)
- Fetch API
- Storage API (`browser.storage` / `chrome.storage`)
- Notifications API
- Alarms API

### Compatibilidade

| Navegador | Versão mínima |
|-----------|---------------|
| Chrome    | 91+           |
| Firefox   | 109+          |

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commitar suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📧 Suporte

Encontrou um bug? Tem uma sugestão? [Abra uma issue](https://github.com/MVoikolesco/gitea-desktop-notify/issues)

## 🙋 Sobre

Criado por [MVoikolesco](https://github.com/MVoikolesco)

---

**Made with ❤️ para a comunidade Gitea**
