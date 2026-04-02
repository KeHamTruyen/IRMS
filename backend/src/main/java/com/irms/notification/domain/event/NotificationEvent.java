package com.irms.notification.domain.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    
    private String type;
    private String title;
    private String message;
    private Object data;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
