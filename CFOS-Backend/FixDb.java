import java.sql.*;
public class FixDb {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/cfosdb", "root", "root");
        Statement stmt = conn.createStatement();
        try {
            stmt.executeUpdate("ALTER TABLE tbl_order DROP CHECK tbl_order_chk_1");
            System.out.println("Dropped check constraint tbl_order_chk_1");
        } catch (Exception e) {
            System.out.println("Constraint might not exist or another error: " + e.getMessage());
        }
    }
}
