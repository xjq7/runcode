export default function isAmount(amount) {
  return /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(amount);
}
