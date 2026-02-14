FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy parent + module poms first for caching
COPY pom.xml /app/pom.xml
COPY producer-api/pom.xml /app/producer-api/pom.xml
COPY consumer-service/pom.xml /app/consumer-service/pom.xml

# Install Maven and prefetch deps
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
RUN mvn -q -pl producer-api -am dependency:go-offline

# Copy only producer sources
COPY producer-api/src /app/producer-api/src

# Build producer jar
RUN mvn -q -pl producer-api -am clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/producer-api/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
