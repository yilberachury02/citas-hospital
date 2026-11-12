import * as sqlRepo from './sql.js';
import * as firestoreRepo from './firestore.js';

function getActive() {
  const mode = (process.env.DB_MODE || 'sql').toLowerCase().trim();
  return mode === 'firestore' ? firestoreRepo : sqlRepo;
}

export function getActiveDbMode() {
  return (process.env.DB_MODE || 'sql').toLowerCase().trim();
}

export const pacientesRepo = {
  getAll: (...args) => getActive().pacientesRepo.getAll(...args),
  create: (...args) => getActive().pacientesRepo.create(...args),
};

export const medicosRepo = {
  getAll: (...args) => getActive().medicosRepo.getAll(...args),
  create: (...args) => getActive().medicosRepo.create(...args),
};

export const especialidadesRepo = {
  getAll: (...args) => getActive().especialidadesRepo.getAll(...args),
};

export const consultoriosRepo = {
  getAll: (...args) => getActive().consultoriosRepo.getAll(...args),
};

export const citasRepo = {
  getAll: (...args) => getActive().citasRepo.getAll(...args),
  create: (...args) => getActive().citasRepo.create(...args),
  updateEstado: (...args) => getActive().citasRepo.updateEstado(...args),
  stats: (...args) => getActive().citasRepo.stats(...args),
};
