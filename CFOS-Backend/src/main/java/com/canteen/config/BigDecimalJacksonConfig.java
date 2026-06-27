package com.canteen.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import org.springframework.boot.jackson.JacksonComponent;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;

@JacksonComponent
public class BigDecimalJacksonConfig {

    public static class Serializer extends JsonSerializer<BigDecimal> {
        private final DecimalFormat formatter = new DecimalFormat("#,##0.00");

        @Override
        public void serialize(BigDecimal value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            if (value == null) {
                gen.writeNull();
            } else {
                gen.writeString(formatter.format(value));
            }
        }
    }

    public static class Deserializer extends JsonDeserializer<BigDecimal> {
        @Override
        public BigDecimal deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String value = p.getText();
            if (value == null || value.trim().isEmpty()) {
                return null;
            }
            try {
                String cleaned = value.replace(",", "").trim();
                return new BigDecimal(cleaned);
            } catch (NumberFormatException e) {
                throw new IOException("Failed to parse BigDecimal value: " + value, e);
            }
        }
    }
}
