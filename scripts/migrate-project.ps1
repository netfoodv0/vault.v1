# Script de Migração do Projeto - PowerShell
# Execute este script no PowerShell como administrador

param(
    [string]$ProjectName = "projeto-migrado"
)

Write-Host "🚀 Iniciando migração do projeto..." -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Definir diretório de destino
$CurrentDir = Get-Location
$TargetDir = Join-Path $CurrentDir.Parent $ProjectName

Write-Host "📁 Diretório de destino: $TargetDir" -ForegroundColor Yellow
Write-Host ""

# Verificar se o diretório de destino já existe
if (Test-Path $TargetDir) {
    Write-Host "❌ O diretório $ProjectName já existe!" -ForegroundColor Red
    Write-Host "Por favor, escolha um nome diferente ou remova o diretório existente." -ForegroundColor Yellow
    exit 1
}

# Criar diretório de destino
Write-Host "📁 Criando diretório de destino..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

# Função para copiar diretório
function Copy-Directory {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        Copy-Item -Path $Source -Destination $Destination -Recurse -Force
        Write-Host "✅ Pasta copiada: $Source" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Pasta não encontrada: $Source" -ForegroundColor Yellow
    }
}

# Função para copiar arquivo
function Copy-ConfigFile {
    param(
        [string]$FileName
    )
    
    $SourcePath = Join-Path $CurrentDir $FileName
    $DestPath = Join-Path $TargetDir $FileName
    
    if (Test-Path $SourcePath) {
        Copy-Item -Path $SourcePath -Destination $DestPath -Force
        Write-Host "✅ Copiado: $FileName" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Arquivo não encontrado: $FileName" -ForegroundColor Yellow
    }
}

# Copiar estrutura de pastas
Write-Host "📁 Copiando estrutura de pastas..." -ForegroundColor Yellow
$FoldersToCopy = @("src", "public", "scripts")

foreach ($folder in $FoldersToCopy) {
    $SourceFolder = Join-Path $CurrentDir $folder
    $DestFolder = Join-Path $TargetDir $folder
    Copy-Directory -Source $SourceFolder -Destination $DestFolder
}

# Copiar arquivos de configuração
Write-Host ""
Write-Host "📄 Copiando arquivos de configuração..." -ForegroundColor Yellow
$ConfigFiles = @(
    "package.json",
    "tsconfig.json", 
    "tailwind.config.js",
    "next.config.js",
    "postcss.config.js",
    "middleware.ts",
    "firebase.json",
    "firestore.rules",
    "firestore.indexes.json",
    ".firebaserc",
    ".gitignore"
)

foreach ($file in $ConfigFiles) {
    Copy-ConfigFile -FileName $file
}

# Navegar para o diretório de destino
Set-Location $TargetDir

# Instalar dependências
Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Criar arquivo .env.local de exemplo
$EnvExample = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Cloudinary (se usado)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Google Maps (se usado)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# Outras variáveis específicas do seu projeto
"@

$EnvExamplePath = Join-Path $TargetDir ".env.local.example"
$EnvExample | Out-File -FilePath $EnvExamplePath -Encoding UTF8
Write-Host "✅ Arquivo .env.local.example criado" -ForegroundColor Green

# Criar README de migração
$ReadmeContent = @"
# Projeto Migrado

Este projeto foi migrado automaticamente. 

## Próximos Passos

1. **Configurar variáveis de ambiente:**
   ```bash
   copy .env.local.example .env.local
   # Editar .env.local com suas credenciais
   ```

2. **Configurar Firebase:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

3. **Testar o projeto:**
   ```bash
   npm run dev
   ```

4. **Verificar funcionalidades:**
   - [ ] Autenticação Firebase
   - [ ] Integração com Google Maps
   - [ ] Upload de imagens (Cloudinary)
   - [ ] QR Code generation
   - [ ] Todas as páginas funcionando

## Estrutura do Projeto

- `src/app/` - Páginas e rotas (App Router)
- `src/components/` - Componentes React
- `src/hooks/` - Custom hooks
- `src/lib/` - Configurações e utilitários
- `src/types/` - Definições TypeScript
- `public/` - Arquivos estáticos

## Scripts Disponíveis

- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificar código
- `npm run type-check` - Verificar tipos TypeScript

## Tecnologias Utilizadas

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)
- Google Maps API
- Cloudinary
- React Hook Form
- Zustand (State Management)
- Framer Motion
- Recharts (Gráficos)
- QR Code generation

## Suporte

Se encontrar problemas, consulte o arquivo `MIGRACAO_GUIA.md` no projeto original.
"@

$ReadmePath = Join-Path $TargetDir "README.md"
$ReadmeContent | Out-File -FilePath $ReadmePath -Encoding UTF8
Write-Host "✅ README.md criado" -ForegroundColor Green

# Voltar ao diretório original
Set-Location $CurrentDir

Write-Host ""
Write-Host "🎉 Migração concluída com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Projeto migrado para: $TargetDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. cd $ProjectName" -ForegroundColor White
Write-Host "2. copy .env.local.example .env.local" -ForegroundColor White
Write-Host "3. Editar .env.local com suas credenciais" -ForegroundColor White
Write-Host "4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulte o README.md para mais informações" -ForegroundColor Cyan 