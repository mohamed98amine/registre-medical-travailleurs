@echo off
echo Demarrage du backend Spring Boot...
cd backend
mvn clean compile
mvn spring-boot:run
pause