# dipucrio-vpn-connect-action (PT)

GitHub Action para conectar as VPNs do DI PUC-Rio.

For the README in english, [click here](#dipucrio-vpn-connect-action-en)

## Inputs

### Inputs Gerais

| Nome                    | Descrição                                                           |
|-------------------------|---------------------------------------------------------------------|
| `private_key_file_name` | Arquivo da chave privada (.p12)                                     | 
| `echo_config`           | Mostrar arquivo de configuração do OpenVPN no log (padrão false)    |

### Inputs de Autenticação

| Nome                   | Descrição                                           |
|------------------------|-----------------------------------------------------|
| `username`             | Nome de Usuário                                     | 
| `password`             | Senha                                               |
| `private_key_password` | Senha de decriptação da chave privada               |

### Environment Inputs

| Name                   | Description                                              |
|------------------------|----------------------------------------------------------|
| `CONFIG_FILE`          | Base64 do arquivo .ovpn                                  | 
| `PRIVATE_KEY_FILE`     | Base64 do arquivo .p12                                   |

> **Nota: É extremamente recomendado que se utilizem [segredos encriptados](https://docs.github.com/en/actions/security-guides/encrypted-secrets) para salvar as credenciais.**

## Modo de Uso

- Receba suas credenciais da Equipe de Suporte
- Transforme seus arquivos .ovpn e .p12 em base64 usando os seguintes comandos:

macOS
```bash
$ base64 -i yourconfigfile.ovpn | pbcopy
$ base64 -i yourpkfile.p12 | pbcopy
```

Linux

```bash
$ base64 -w 0 yourconfigfile.ovpn | pbcopy
$ base64 -w 0 yourpkfile.p12 | pbcopy
```
- Use no seu workflow como o exemplo a seguir:

```yaml
      - name: Checkout
        uses: actions/checkout@v4
      - name: Instalar OpenVPN
        run: |
          sudo apt update
          sudo apt install -y openvpn openvpn-systemd-resolved
      - name: Conectar a VPN
        uses: "aisepucrio/dipucrio-vpn-connect-action@latest"
        with:
          username: ${{ secrets.OVPN_USERNAME }}
          password: ${{ secrets.OVPN_PASSWORD }}
          private_key_password: ${{ secrets.OVPN_PK_PASSWORD }}
          private_key_filename: ${{ secrets.OVPN_PK_FILENAME }}
        env:
          CONFIG_FILE: ${{ secrets.OVPN_CONFIG_FILE }}
          PRIVATE_KEY_FILE: ${{ secrets.OVPN_PRIVATE_KEY_FILE }}
      - name: Build
        run: ./gradlew clean build
      # O processo do OpenVPN é automaticamente encerrado na fase post-action
```

## Licença

Isto é um fork de [github-openvpn-connect-action](https://github.com/kota65535/github-openvpn-connect-action), modificado para suprir o uso do [Departamento de Informática da PUC-Rio](https://inf.puc-rio.br). Todos os direitos vão para [Tomohiko Ozawa](https://github.com/kota65535/) como dito na [Licença MIT (em inglês)](LICENSE).

# dipucrio-vpn-connect-action (EN)

GitHub Action to connect to the VPNs of DI PUC-Rio.

Para o README em português, [clique aqui](#dipucrio-vpn-connect-action-pt)

## Inputs

### General Inputs

| Name                    | Description                                            |
|-------------------------|--------------------------------------------------------|
| `private_key_file_name` | Filename of the Private Key .p12                       | 
| `echo_config`           | Echo OpenVPN config file to the log (default false)    |

### Authentication Inputs

| Name                   | Description                        |
|------------------------|------------------------------------|
| `username`             | Username                           | 
| `password`             | Password                           |
| `private_key_password` | Private Key Password               |

### Environment Inputs

| Name                   | Description                        |
|------------------------|------------------------------------|
| `CONFIG_FILE`          | Base64 of the .ovpn file           | 
| `PRIVATE_KEY_FILE`     | Base64 of the .p12 file            |

> **Note: It is strongly recommended that you provide all credentials
via [encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).**

## Usage

- Receive your credentials from the Support Team
- Transform your .ovpn and .p12 files in base64 using the following commands:

macOS
```bash
$ base64 -i yourconfigfile.ovpn | pbcopy
$ base64 -i yourpkfile.p12 | pbcopy
```

Linux

```bash
$ base64 -w 0 yourconfigfile.ovpn | pbcopy
$ base64 -w 0 yourpkfile.p12 | pbcopy
```
- Usage in your workflow is like following:

```yaml
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install OpenVPN
        run: |
          sudo apt update
          sudo apt install -y openvpn openvpn-systemd-resolved
      - name: Connect to VPN
        uses: "aisepucrio/dipucrio-vpn-connect-action@latest"
        with:
          username: ${{ secrets.OVPN_USERNAME }}
          password: ${{ secrets.OVPN_PASSWORD }}
          private_key_password: ${{ secrets.OVPN_PK_PASSWORD }}
          private_key_filename: ${{ secrets.OVPN_PK_FILENAME }}
        env:
          CONFIG_FILE: ${{ secrets.OVPN_CONFIG_FILE }}
          PRIVATE_KEY_FILE: ${{ secrets.OVPN_PRIVATE_KEY_FILE }}
      - name: Build something
        run: ./gradlew clean build
      # The openvpn process is automatically terminated in post-action phase
```

## License

This is a fork of [github-openvpn-connect-action](https://github.com/kota65535/github-openvpn-connect-action), modified to suit the use of the [Department of Informatics of PUC-Rio](https://inf.puc-rio.br). All rights goes to [Tomohiko Ozawa](https://github.com/kota65535/) as said in the [MIT license](LICENSE).
