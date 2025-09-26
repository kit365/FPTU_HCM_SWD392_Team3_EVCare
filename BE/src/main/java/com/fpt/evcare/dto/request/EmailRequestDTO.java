package com.fpt.evcare.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequestDTO {

    private String to;
    private String subject;
    private String text;
    private String fullName;
    private String code;


}
