FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy parent + module poms first for caching
COPY pom.xml /app/pom.xml
COPY consumer-service/pom.xml /app/consumer-service/pom.xml
COPY producer-api/pom.xml /app/producer-api/pom.xml

# Install Maven and prefetch deps
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
RUN mvn -q -pl consumer-service -am dependency:go-offline

# Copy only consumer sources
COPY consumer-service/src /app/consumer-service/src

# Build consumer jar
RUN mvn -q -pl consumer-service -am clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/consumer-service/target/*.jar /app/app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]
