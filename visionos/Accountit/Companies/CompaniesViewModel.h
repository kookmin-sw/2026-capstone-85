//
//  CompaniesViewModel.h
//  Accountit
//
//  Created by Jinwoo Kim on 5/18/26.
//

#import <UIKit/UIKit.h>
#import "CompanyItemModel.h"

NS_ASSUME_NONNULL_BEGIN

@interface CompaniesViewModel : NSObject
+ (instancetype)new NS_UNAVAILABLE;
- (instancetype)init NS_UNAVAILABLE;
- (instancetype)initWithDataSource:(UICollectionViewDiffableDataSource<NSString *, CompanyItemModel *> *)dataSource;
- (void)loadDataSource;
@end

NS_ASSUME_NONNULL_END
