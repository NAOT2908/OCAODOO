import 'package:flutter_dotenv/flutter_dotenv.dart';

class Config {
  static String requiredModule = dotenv.get('REQUIRED_MODULE', fallback: '');
}
