#!/usr/bin/env node

const admin = require('firebase-admin');

// Configurações do projeto
const projectId = 'vault-v1-c2449';

console.log('🔥 Configurando Firebase para o projeto vault-v1-c2449...\n');

console.log('📋 INSTRUÇÕES PARA CONFIGURAR O FIREBASE:\n');

console.log('1️⃣ AUTHENTICATION:');
console.log('   • Acesse: https://console.firebase.google.com/project/vault-v1-c2449/authentication');
console.log('   • Vá em "Sign-in method"');
console.log('   • Ative "Email/password"');
console.log('   • Salve as configurações\n');

console.log('2️⃣ FIRESTORE DATABASE:');
console.log('   • Acesse: https://console.firebase.google.com/project/vault-v1-c2449/firestore');
console.log('   • Clique em "Create database"');
console.log('   • Escolha "Start in test mode"');
console.log('   • Selecione uma região (us-central1 é recomendado)');
console.log('   • Clique em "Done"\n');

console.log('3️⃣ REGRAS DE SEGURANÇA DO FIRESTORE:');
console.log('   Substitua as regras padrão por estas:\n');
console.log('```javascript');
console.log('rules_version = \'2\';');
console.log('service cloud.firestore {');
console.log('  match /databases/{database}/documents {');
console.log('    // Usuários podem ler/escrever apenas seus próprios dados');
console.log('    match /users/{userId} {');
console.log('      allow read, write: if request.auth != null && request.auth.uid == userId;');
console.log('    }');
console.log('    ');
console.log('    // Permitir leitura de dados públicos (se necessário)');
console.log('    match /public/{document=**} {');
console.log('      allow read: if true;');
console.log('      allow write: if request.auth != null;');
console.log('    }');
console.log('  }');
console.log('}');
console.log('```\n');

console.log('4️⃣ STORAGE (OPCIONAL):');
console.log('   • Acesse: https://console.firebase.google.com/project/vault-v1-c2449/storage');
console.log('   • Clique em "Get started"');
console.log('   • Aceite as regras padrão\n');

console.log('5️⃣ CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE:');
console.log('   Crie um arquivo .env.local na raiz do projeto com:');
console.log('');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCfzGanhBUCu9WIAj_JQQmId2raziwRVao');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vault-v1-c2449.firebaseapp.com');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=vault-v1-c2449');
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vault-v1-c2449.firebasestorage.app');
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=931375217236');
console.log('NEXT_PUBLIC_FIREBASE_APP_ID=1:931375217236:web:dd052a9423a696dced8bc1');
console.log('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-VTHCNMM6LV');
console.log('');

console.log('✅ PRONTO! Após seguir essas etapas, seu SaaS estará 100% funcional!');
console.log('🚀 Execute: npm run dev');
console.log('🌐 Acesse: http://localhost:3000\n');

console.log('💡 DICA: Teste criando uma conta em /register e fazendo login em /login');
console.log('📱 O dashboard estará disponível em /dashboard\n');

console.log('🔗 Links úteis:');
console.log(`   • Console Firebase: https://console.firebase.google.com/project/${projectId}`);
console.log(`   • Authentication: https://console.firebase.google.com/project/${projectId}/authentication`);
console.log(`   • Firestore: https://console.firebase.google.com/project/${projectId}/firestore`);
console.log(`   • Analytics: https://console.firebase.google.com/project/${projectId}/analytics`); 