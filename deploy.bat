@echo off

echo ===== DEPLOY START =====

cd /d %~dp0

echo.
echo 1. Добавляем изменения...
git add .

echo.
echo 2. Коммит...
git commit -m "update cards"

echo.
echo 3. Отправка на GitHub...
git push

echo.
echo ===== ГОТОВО =====
pause