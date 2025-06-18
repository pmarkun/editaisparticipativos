import { NextResponse } from 'next/server';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs, addDoc, updateDoc, Timestamp } from 'firebase/firestore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
  }

  const pendingQuery = query(collection(db, 'pendingVotes'), where('token', '==', token));
  const pendingSnap = await getDocs(pendingQuery);
  if (pendingSnap.empty) {
    return NextResponse.json({ error: 'Token não encontrado' }, { status: 404 });
  }

  const pendingDoc = pendingSnap.docs[0];
  const data = pendingDoc.data();

  if (data.status !== 'Pendente') {
    return NextResponse.json({ message: 'Voto já confirmado' });
  }

  const duplicateQuery = query(
    collection(db, 'votes'),
    where('editalId', '==', data.editalId),
    where('cpf', '==', data.cpf)
  );
  const duplicateSnap = await getDocs(duplicateQuery);

  if (duplicateSnap.empty) {
    await addDoc(collection(db, 'votes'), {
      fullName: data.fullName,
      cpf: data.cpf,
      email: data.email,
      phone: data.phone,
      editalId: data.editalId,
      projectId: data.projectId,
      projectName: data.projectName,
      votedAt: Timestamp.now(),
    });
    await updateDoc(pendingDoc.ref, { status: 'Válido' });
    return NextResponse.json({ message: 'Voto confirmado' });
  } else {
    await updateDoc(pendingDoc.ref, { status: 'Duplicado' });
    return NextResponse.json({ message: 'CPF já votou neste edital' });
  }
}
