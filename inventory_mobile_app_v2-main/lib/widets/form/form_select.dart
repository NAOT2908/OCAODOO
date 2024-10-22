import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:flutter/material.dart';

class FormSelect<T> extends StatelessWidget {
  final List<DropdownMenuItem<T>> items;
  final T? selectedValue;
  final ValueChanged<T?>? onChanged;
  final Function(T?)? onSaved;
  final bool searchable;
  final bool Function(DropdownMenuItem<T>, String)? searchMatchFn;
  final String? hintText;

  final TextEditingController textEditingController = TextEditingController();

  FormSelect({
    super.key,
    required this.items,
    this.hintText,
    this.onChanged,
    this.onSaved,
    this.selectedValue,
    this.searchable = false,
    this.searchMatchFn,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField2<T>(
      isExpanded: true,
      decoration: InputDecoration(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.white,
      ),
      hint: hintText != null ? Text(hintText!) : null,
      items: items,
      onChanged: onChanged,
      onSaved: onSaved,
      iconStyleData: const IconStyleData(
        icon: Icon(
          Icons.arrow_drop_down,
          color: Colors.black45,
        ),
        iconSize: 24,
      ),
      dropdownStyleData: DropdownStyleData(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15),
        ),
      ),
      menuItemStyleData: const MenuItemStyleData(
        padding: EdgeInsets.symmetric(horizontal: 16),
      ),
      value: selectedValue,
      dropdownSearchData: searchable
          ? DropdownSearchData(
              searchController: textEditingController,
              searchInnerWidgetHeight: 50,
              searchInnerWidget: Container(
                height: 50,
                padding: const EdgeInsets.only(
                  top: 8,
                  bottom: 4,
                  right: 8,
                  left: 8,
                ),
                child: TextFormField(
                  expands: true,
                  maxLines: null,
                  controller: textEditingController,
                  decoration: InputDecoration(
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 8,
                    ),
                    hintText: 'Search for an item...',
                    hintStyle: const TextStyle(fontSize: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              searchMatchFn: searchMatchFn ??
                  (item, searchValue) {
                    return item.value.toString().contains(searchValue);
                  },
            )
          : null,
      onMenuStateChange: searchable
          ? (isOpen) {
              if (!isOpen) {
                textEditingController.clear();
              }
            }
          : null,
    );
  }
}
