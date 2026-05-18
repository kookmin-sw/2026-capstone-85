//
//  CompanyItemModel.h
//  Accountit
//
//  Created by Jinwoo Kim on 5/18/26.
//

#import <AccountitAPI/AccountitAPI.h>

NS_ASSUME_NONNULL_BEGIN

@interface CompanyItemModel : NSObject
+ (instancetype)new NS_UNAVAILABLE;
- (instancetype)init NS_UNAVAILABLE;
- (instancetype)initWithItem:(AccountitAPICPACompanyListItem *)item;
@property (copy, nonatomic, readonly) NSString *name;
@end

NS_ASSUME_NONNULL_END
