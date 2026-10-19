FROM node:24-alpine AS frontend
WORKDIR /app/frontend

COPY employee-creator-frontend/package.json employee-creator-frontend/package-lock.json ./
RUN npm ci

COPY employee-creator-frontend/ ./

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app

COPY pom.xml ./
RUN mvn -B -ntp dependency:go-offline

COPY src ./src
COPY --from=frontend /app/frontend/dist/ ./src/main/resources/static/
RUN mvn -B -ntp clean package -DskipTests

FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

RUN useradd -r -u 1001 appuser
COPY --from=backend /app/target/*.jar app.jar
USER appuser


ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
