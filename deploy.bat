@echo off

echo ===== DEPLOY START =====

cd /d %~dp0

echo.
echo 1. Добавляем ВСЁ...
git add -A

echo.
echo 2. Коммит...
git commit -m "update cards"

echo.
echo 3. Отправка...
git push

echo.
echo ===== ГОТОВО =====
pause