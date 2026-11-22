// Precargador para correr un laboratorio vulnerable SIN Docker, en tu propia máquina: Juice Shop es vulnerable a propósito, así que SOLO escucha en 127.0.0.1.
// Sin esto escucharía en todas las interfaces y quedaría expuesto a tu red.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const net = require('net');
const original = net.Server.prototype.listen;
net.Server.prototype.listen = function (...args) {
  const first = args[0];
  if (first && typeof first === 'object' && !Array.isArray(first) && !first.fd && !first.path) {
    return original.call(this, { ...first, host: '127.0.0.1' }, ...args.slice(1));
  }
  if (typeof first === 'number' || /^\d+$/.test(String(first))) {
    const rest = typeof args[1] === 'string' ? args.slice(2) : args.slice(1);
    return original.call(this, first, '127.0.0.1', ...rest);
  }
  return original.apply(this, args);
};
