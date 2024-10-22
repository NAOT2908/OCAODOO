import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/widets/stock_picking/stock_picking_status_badge.dart';

class StockPickingListItem extends StatelessWidget {
  final StockPickingTypeEnum type;
  final StockPicking stockPicking;

  const StockPickingListItem({
    super.key,
    required this.type,
    required this.stockPicking,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.pushNamed(
          'stock_picking.show',
          pathParameters: {'id': stockPicking.id.toString()},
        );
      },
      child: Card(
        color: Colors.white,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 8,
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    stockPicking.name ?? '',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  Text(
                    stockPicking.scheduledDate != null
                        ? DateFormat('yyyy-MM-dd hh:mm:ss')
                            .format(stockPicking.scheduledDate!)
                        : '',
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(
                height: 12,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Từ: ${stockPicking.location?.name ?? ''}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.secondary,
                        ),
                      ),
                      const SizedBox(
                        height: 4,
                      ),
                      Text(
                        'Đến: ${stockPicking.destLocation?.name ?? ''}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.secondary,
                        ),
                      ),
                    ],
                  ),
                  stockPicking.state != null
                      ? StockPickingStatusBadge(
                          state: stockPicking.state!,
                        )
                      : Container(),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
