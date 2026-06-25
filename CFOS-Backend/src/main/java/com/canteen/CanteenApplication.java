package com.canteen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class CanteenApplication {
	public static void main(String[] args) {
		SpringApplication.run(CanteenApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void openBrowser() {
		try {
			// Change this URL if the port or context path is different
			Runtime.getRuntime().exec("cmd /c start http://localhost:8081/scalar.html");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
