import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/auth/auth_bloc.dart';
import 'package:inven_barcode_app/bloc/auth/auth_event.dart';
import 'package:inven_barcode_app/bloc/auth/auth_state.dart';
import 'package:inven_barcode_app/bloc/profile/profile_bloc.dart';
import 'package:inven_barcode_app/bloc/profile/profile_state.dart';

class PrimaryDrawer extends StatelessWidget {
  const PrimaryDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              color: Theme.of(context).colorScheme.primary,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 20,
                bottom: 20,
              ),
              child: BlocBuilder<ProfileBloc, ProfileState>(
                builder: (BuildContext context, ProfileState state) {
                  final user = state.user;

                  if (user == null) {
                    return BlocBuilder<AuthBloc, AuthState>(
                      builder: (BuildContext context, AuthState state) {
                        final session = state.odooClient!.sessionId!;

                        return Column(
                          children: [
                            ClipOval(
                              child: SizedBox.fromSize(
                                size: const Size.fromRadius(50),
                                child: Image.asset(
                                  'assets/images/default-profile.png',
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 6,
                            ),
                            Text(session.userName),
                          ],
                        );
                      },
                    );
                  }

                  return Column(
                    children: [
                      ClipOval(
                        child: SizedBox.fromSize(
                          size: const Size.fromRadius(50),
                          child: user.avatar != null
                              ? Image.memory(
                                  base64Decode(user.avatar!),
                                )
                              : Image.asset(
                                  'assets/images/default-profile.png',
                                ),
                        ),
                      ),
                      const SizedBox(
                        height: 6,
                      ),
                      Text(
                        user.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            Wrap(
              children: [
                ListTile(
                  leading: const Icon(Icons.scanner_outlined),
                  title: const Text('Quét Mã'),
                  onTap: () {
                    context.pushNamed('scanner.index');
                  },
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.home),
                  title: const Text('Trang chính'),
                  onTap: () => context.pushNamed('index'),
                ),
                ListTile(
                  leading: const Icon(Icons.arrow_circle_right),
                  title: const Text('Nhập Kho'),
                  onTap: () => context.pushNamed('receipts.index'),
                ),
                ListTile(
                  leading: const Icon(Icons.arrow_circle_left),
                  title: const Text('Xuất Kho'),
                  onTap: () => context.pushNamed('delivery.index'),
                ),
                ListTile(
                  leading: const Icon(Icons.receipt_long_rounded),
                  title: const Text('Chuyển Nội Bộ'),
                  onTap: () => context.pushNamed('internal.index'),
                ),
                ListTile(
                  leading: const Icon(Icons.production_quantity_limits),
                  title: const Text('Sản phẩm'),
                  onTap: () => context.pushNamed('products.index'),
                ),
                const Divider(),
                BlocListener<AuthBloc, AuthState>(
                  listener: (BuildContext context, AuthState state) {
                    if (state.logOutSuccess) {
                      context.pushNamed('login');
                    }
                  },
                  child: ListTile(
                    leading: const Icon(Icons.logout),
                    title: const Text('Đăng xuất'),
                    onTap: () async {
                      final authBloc = context.read<AuthBloc>();

                      authBloc.add(StartLogoutEvent());
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
