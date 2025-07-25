#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando migração do projeto...\n');

// Função para verificar se um diretório existe
function directoryExists(dirPath) {
  return fs.existsSync(dirPath);
}

// Função para copiar diretório recursivamente
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// Função para copiar arquivo
function copyFile(source, destination) {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} -> ${destination}`);
  } else {
    console.log(`⚠️  Arquivo não encontrado: ${source}`);
  }
}

// Função para executar comando
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} concluído`);
  } catch (error) {
    console.error(`❌ Erro ao ${description}:`, error.message);
    process.exit(1);
  }
}

// Função principal de migração
function migrateProject() {
  const currentDir = process.cwd();
  const projectName = process.argv[2] || 'projeto-migrado';
  const targetDir = path.join(currentDir, '..', projectName);
  
  console.log(`📁 Diretório de destino: ${targetDir}\n`);
  
  // Verificar se o diretório de destino já existe
  if (directoryExists(targetDir)) {
    console.log(`❌ O diretório ${projectName} já existe!`);
    console.log('Por favor, escolha um nome diferente ou remova o diretório existente.');
    process.exit(1);
  }
  
  // Criar diretório de destino
  console.log('📁 Criando diretório de destino...');
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Copiar estrutura de pastas
  const foldersToCopy = [
    'src',
    'public',
    'scripts'
  ];
  
  console.log('\n📁 Copiando estrutura de pastas...');
  for (const folder of foldersToCopy) {
    if (directoryExists(folder)) {
      copyDirectory(folder, path.join(targetDir, folder));
      console.log(`✅ Pasta copiada: ${folder}`);
    } else {
      console.log(`⚠️  Pasta não encontrada: ${folder}`);
    }
  }
  
  // Copiar arquivos de configuração
  const configFiles = [
    'package.json',
    'tsconfig.json',
    'tailwind.config.js',
    'next.config.js',
    'postcss.config.js',
    'middleware.ts',
    'firebase.json',
    'firestore.rules',
    'firestore.indexes.json',
    '.firebaserc',
    '.gitignore'
  ];
  
  console.log('\n📄 Copiando arquivos de configuração...');
  for (const file of configFiles) {
    copyFile(file, path.join(targetDir, file));
  }
  
  // Navegar para o diretório de destino
  process.chdir(targetDir);
  
  // Instalar dependências
  console.log('\n📦 Instalando dependências...');
  runCommand('npm install', 'Instalar dependências');
  
  // Verificar se o projeto está funcionando
  console.log('\n🔍 Verificando configuração...');
  
  try {
    // Verificar TypeScript
    runCommand('npm run type-check', 'Verificar tipos TypeScript');
  } catch (error) {
    console.log('⚠️  Erro na verificação de tipos. Isso é normal se houver configurações pendentes.');
  }
  
  // Criar arquivo .env.local de exemplo
  const envExample = `# Firebase Configuration
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
`;
  
  fs.writeFileSync(path.join(targetDir, '.env.local.example'), envExample);
  console.log('✅ Arquivo .env.local.example criado');
  
  // Criar README de migração
  const readmeContent = `# Projeto Migrado

Este projeto foi migrado automaticamente. 

## Próximos Passos

1. **Configurar variáveis de ambiente:**
   \`\`\`bash
   cp .env.local.example .env.local
   # Editar .env.local com suas credenciais
   \`\`\`

2. **Configurar Firebase:**
   \`\`\`bash
   npm install -g firebase-tools
   firebase login
   firebase init
   \`\`\`

3. **Testar o projeto:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Verificar funcionalidades:**
   - [ ] Autenticação Firebase
   - [ ] Integração com Google Maps
   - [ ] Upload de imagens (Cloudinary)
   - [ ] QR Code generation
   - [ ] Todas as páginas funcionando

## Estrutura do Projeto

- \`src/app/\` - Páginas e rotas (App Router)
- \`src/components/\` - Componentes React
- \`src/hooks/\` - Custom hooks
- \`src/lib/\` - Configurações e utilitários
- \`src/types/\` - Definições TypeScript
- \`public/\` - Arquivos estáticos

## Scripts Disponíveis

- \`npm run dev\` - Desenvolvimento
- \`npm run build\` - Build de produção
- \`npm run start\` - Servidor de produção
- \`npm run lint\` - Verificar código
- \`npm run type-check\` - Verificar tipos TypeScript

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

Se encontrar problemas, consulte o arquivo \`MIGRACAO_GUIA.md\` no projeto original.
`;
  
  fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent);
  console.log('✅ README.md criado');
  
  console.log('\n🎉 Migração concluída com sucesso!');
  console.log(`\n📁 Projeto migrado para: ${targetDir}`);
  console.log('\n📋 Próximos passos:');
  console.log('1. cd ' + projectName);
  console.log('2. cp .env.local.example .env.local');
  console.log('3. Editar .env.local com suas credenciais');
  console.log('4. npm run dev');
  console.log('\n📖 Consulte o README.md para mais informações');
}

// Executar migração
if (require.main === module) {
  migrateProject();
}

module.exports = { migrateProject }; 