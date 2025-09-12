
#Stage 1: build: Giai đoạn đầu tiên sử dụng image maven:3.9.8-amazoncorretto-21
# để build ứng dụng Java Spring Boot

FROM maven:3.9.8-amazoncorretto-21 AS build
#Tạo thư mục làm việc /app trong container
WORKDIR /app

#Cú pháp COPY là: COPY <nguồn> <đích>

#Copy file pom.xml vào thư mục hiện tại (/app)
COPY pom.xml .
#COPY ../.env .

#Copy thư mục src vào thư mục src trong thư mục hiện tại (/app/src)
COPY src ./src

RUN mvn clean package -DskipTests -Dmaven.test.skip=true

#Stage 2: create image
FROM amazoncorretto:21.0.4

WORKDIR /app
EXPOSE 8080

#--from=build: Lấy files từ stage có tên "build" (stage đầu tiên)
#/app/target/*jar: Đường dẫn nguồn, trong đó *jar là wildcard lấy tất cả file có đuôi .jar
#app.jar: Tên file đích sẽ được lưu trong stage hiện tại
COPY --from=build /app/target/*jar app.jar

#Tương tự, lệnh thứ hai copy file .env từ stage "build" vào thư mục hiện tại của stage cuối
#COPY --from=build /app/.env .

ENTRYPOINT ["java", "-jar", "app.jar"]
