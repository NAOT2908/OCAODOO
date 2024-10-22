import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/widets/primary_drawer.dart';

class ActionButton {
  final VoidCallback onPressed;
  final IconData icon;

  ActionButton({
    required this.onPressed,
    required this.icon,
  });

  Widget render() {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.transparent,
        shadowColor: Colors.transparent,
      ),
      child: Icon(
        icon,
        color: Colors.white,
        size: 30.0,
      ),
    );
  }
}

class PrimaryScaffold extends StatefulWidget {
  final Widget child;
  final String? title;
  final bool shouldBack;
  final List<ActionButton>? actions;

  const PrimaryScaffold({
    super.key,
    required this.child,
    this.title,
    this.shouldBack = false,
    this.actions,
  });

  @override
  State<PrimaryScaffold> createState() => _PrimaryScaffoldState();
}

class _PrimaryScaffoldState extends State<PrimaryScaffold> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        key: _scaffoldKey,
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.primary,
          title: Text(
            widget.title ?? 'Inventory App',
            style: const TextStyle(
              color: Colors.white,
            ),
          ),
          centerTitle: true,
          leading: ElevatedButton(
            onPressed: () {
              if (widget.shouldBack) {
                context.canPop() ? context.pop() : context.goNamed('index');
                return;
              }
              _scaffoldKey.currentState?.openDrawer();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
            ),
            child: Icon(
              widget.shouldBack ? Icons.arrow_back_ios : Icons.menu,
              color: Colors.white,
              size: widget.shouldBack ? 20.0 : 30.0,
            ),
          ),
          actions: widget.actions?.map((action) {
            return action.render();
          }).toList(),
        ),
        drawer: const PrimaryDrawer(),
        body: widget.child);
  }
}
