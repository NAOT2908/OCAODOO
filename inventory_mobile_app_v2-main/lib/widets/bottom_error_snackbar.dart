import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';

void showBottomErrorSnackBar(BuildContext context, String message) async {
  final snackBar = SnackBar(
    content: Center(
      child: Text(message),
    ),
    behavior: SnackBarBehavior.floating,
    // Makes it float above the bottom
    backgroundColor: Colors.black87,
    margin: const EdgeInsets.symmetric(horizontal: 50, vertical: 20),
    // Control positioning
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10),
    ), // Rounded corners
  );

  // Initialize AudioPlayer
  final player = AudioPlayer();

  // Load the audio file (You can use a local or network sound file)
  await player.play(AssetSource('sounds/error-sound.mp3'));

  // Show the SnackBar using ScaffoldMessenger
  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}
