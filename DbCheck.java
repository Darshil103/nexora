import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/nexora?allowPublicKeyRetrieval=true&useSSL=false", "nexora", "nexora123");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, email, password_hash, user_type, status, kyc_status FROM users LIMIT 10");
            while (rs.next()) {
                System.out.println(rs.getString("id") + " | " + rs.getString("email") + " | " + rs.getString("password_hash") + " | " + rs.getString("user_type") + " | " + rs.getString("status") + " | " + rs.getString("kyc_status"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
