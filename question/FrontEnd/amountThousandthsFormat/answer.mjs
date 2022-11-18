export default function f(amount) {
  return amount.replace(/(?<!\.\d*)\B(?=(?:\d{3})+\b)/g, ',');
}
