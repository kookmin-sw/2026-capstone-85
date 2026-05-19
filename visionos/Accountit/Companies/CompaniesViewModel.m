//
//  CompaniesViewModel.m
//  Accountit
//
//  Created by Jinwoo Kim on 5/18/26.
//

#import "CompaniesViewModel.h"
#import <AccountitAPI/AccountitAPI.h>

@interface CompaniesViewModel ()
@property (retain, nonatomic, readonly) UICollectionViewDiffableDataSource<NSString *,CompanyItemModel *> *dataSource;
@property (retain, nonatomic, nullable) NSProgress *progress;
@end

@implementation CompaniesViewModel

- (instancetype)initWithDataSource:(UICollectionViewDiffableDataSource<NSString *,CompanyItemModel *> *)dataSource {
    if (self = [super init]) {
        self->_dataSource = [dataSource retain];
    }

    return self;
}

- (void)dealloc {
    [_dataSource release];
    [_progress cancel];
    [_progress release];
    [super dealloc];
}

- (void)loadDataSource {
    [self.progress cancel];

    self.progress = [AccountitAPIService cpaCompaniesWithQuery:nil completionHandler:^(AccountitAPICPACompanyListResponse * _Nullable response, NSError * _Nullable * _Nullable error) {
        assert(error == nil);
        NSMutableArray<CompanyItemModel *> *items = [[NSMutableArray alloc] initWithCapacity:response.items.count];

        for (AccountitAPICPACompanyListItem *item in response.items) {
            CompanyItemModel *itemModel = [[CompanyItemModel alloc] initWithItem:item];
            [items addObject:itemModel];
            [itemModel release];
        }

        NSDiffableDataSourceSnapshot<NSString *, CompanyItemModel *> *snapshot = [[NSDiffableDataSourceSnapshot alloc] init];
        [snapshot appendSectionsWithIdentifiers:@[@"0"]];
        [snapshot appendItemsWithIdentifiers:items intoSectionWithIdentifier:@"0"];
        [items release];

        dispatch_async(dispatch_get_main_queue(), ^{
            [self.dataSource applySnapshot:snapshot animatingDifferences:YES];
        });

        [snapshot release];
    }];
}

@end
