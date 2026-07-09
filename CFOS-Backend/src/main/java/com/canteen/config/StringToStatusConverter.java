package com.canteen.config;

import com.canteen.model.Status;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToStatusConverter implements Converter<String, Status> {
    @Override
    public Status convert(String source) {
        return Status.fromString(source);
    }
}
