@echo off
cd /d %~dp0

echo =========================
echo Updating project...
echo =========================

:: Устанавливаем зависимости
call npm install

:: Сборка (если используешь build)
call npm run build

:: Перезапуск (если есть pm2)
:: call pm2 restart all

echo =========================
echo DONE
echo =========================

:: Закрыть окно через 2 секунды
timeout /t 2 >nul
exit