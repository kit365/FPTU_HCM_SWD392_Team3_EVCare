package com.fpt.evcare.utils;


import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UtilFunction {

    //Hàm xử lý chuỗi String cho thuộc tính search for user
    public static String concatenateSearchField(String... fields) {
        return Arrays.stream(fields)
                .filter(Objects::nonNull) // bỏ null
                .map(s -> s.toLowerCase().replaceAll("\\s+", "")) // chuẩn hóa: bỏ khoảng trắng, chữ thường
                .filter(s -> !s.isEmpty()) // bỏ chuỗi rỗng
                .collect(Collectors.joining("-")); // nối bằng dấu gạch ngang
    }

    //Lấy danh sách enums
    public static <E extends Enum<E>> List<String> getEnumValues(Class<E> enumClass) {
        return Arrays.stream(enumClass.getEnumConstants())
                .map(Enum::name)
                .collect(Collectors.toList());
    }
}
