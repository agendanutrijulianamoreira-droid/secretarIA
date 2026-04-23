import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import fs from "fs";

// Simple .env parser
const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8")
    .split("\n")
    .filter(line => line.includes("="))
    .map(line => line.split("="))
);

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId:         env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId:             env.VITE_FIREBASE_APP_ID?.trim(),
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  console.log("🚀 Iniciando migração: clientes -> clients...");
  
  const oldCol = collection(db, "clientes");
  const snap = await getDocs(oldCol);
  
  console.log(`📦 Encontrados ${snap.size} documentos em 'clientes'.`);
  
  for (const clientDoc of snap.docs) {
    const data = clientDoc.data();
    const id = clientDoc.id;
    
    console.log(`➡️ Migrando cliente: ${data.name || id}...`);
    
    // Criar documento principal em 'clients'
    await setDoc(doc(db, "clients", id), data);
    
    // Migrar subcoleções conhecidas
    const subCollections = ["contatos", "chat_messages", "invoices", "portal_messages", "agendamentos"];
    
    for (const sub of subCollections) {
      const subSnap = await getDocs(collection(db, "clientes", id, sub));
      if (!subSnap.empty) {
        console.log(`   └─ Migrando subcoleção: ${sub} (${subSnap.size} itens)`);
        for (const itemDoc of subSnap.docs) {
          await setDoc(doc(db, "clients", id, sub, itemDoc.id), itemDoc.data());
        }
      }
    }
  }
  
  console.log("✅ Migração concluída com sucesso!");
}

migrate().catch(console.error);
