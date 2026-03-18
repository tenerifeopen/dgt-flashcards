@echo off
echo === Обновление сайта ===
git add .
git commit -m "update cards"
git push
echo === Готово ===
pause