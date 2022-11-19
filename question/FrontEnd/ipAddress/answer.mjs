export default function f(ip) {
  return /((2(5[0-4]|[0-4]\d)|1\d{2}|\d{1,2})\.){3}(2(5[0-4]|[0-4]\d)|1\d{2}|\d{1,2})/.test(
    ip
  );
}
