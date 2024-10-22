import 'package:equatable/equatable.dart';

class ScannerState extends Equatable {
  final bool searchingBarcode;
  final bool isEmpty;
  final dynamic result;
  final bool resultError;

  const ScannerState({
    this.searchingBarcode = false,
    this.isEmpty = false,
    this.result,
    this.resultError = false,
  });

  @override
  List<Object?> get props => [
        searchingBarcode,
        isEmpty,
        result,
        resultError,
      ];

  ScannerState copyWith({
    bool? searchingBarcode,
    bool? isEmpty,
    dynamic result,
    bool? resultError,
  }) {
    return ScannerState(
      searchingBarcode: searchingBarcode ?? this.searchingBarcode,
      isEmpty: isEmpty ?? this.isEmpty,
      result: result ?? this.result,
      resultError: resultError ?? this.resultError,
    );
  }

  ScannerState reset() {
    return const ScannerState();
  }
}
